import { Attendance, Task, Worker, Project, DailyReport } from "../models/index.js";

/**
 * Export Service for Data Export (CSV, JSON)
 * Generates reports in various formats for download
 */

export const exportService = {
  /**
   * Convert array of objects to CSV format
   */
  convertToCSV: (data, headers = null) => {
    if (!data || data.length === 0) {
      return "";
    }

    // Use provided headers or extract from first object
    const cols = headers || Object.keys(data[0]);
    const csv = [
      cols.join(","),
      ...data.map((obj) =>
        cols
          .map((col) => {
            const val = obj[col];
            // Handle values with commas or quotes
            if (
              typeof val === "string" &&
              (val.includes(",") || val.includes('"'))
            ) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      ),
    ].join("\n");

    return csv;
  },

  /**
   * Export attendance data as CSV
   */
  exportAttendanceCSV: async (projectId, startDate, endDate) => {
    const data = await Attendance.aggregate([
      {
        $match: {
          projectId: projectId,
          checkInAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: "workers",
          localField: "workerId",
          foreignField: "_id",
          as: "worker",
        },
      },
      {
        $unwind: "$worker",
      },
      {
        $project: {
          workerId: "$workerId",
          workerName: {
            $concat: ["$worker.firstname", " ", "$worker.lastname"],
          },
          checkInTime: "$checkInAt",
          checkOutTime: "$checkOutAt",
          checkInLat: "$checkInLat",
          checkInLon: "$checkInLng",
          checkOutLat: "$checkOutLat",
          checkOutLon: "$checkOutLng",
          status: "$status",
          method: "$method",
        },
      },
      {
        $sort: { checkInTime: 1 },
      },
    ]);

    const headers = [
      "workerId",
      "workerName",
      "checkInTime",
      "checkOutTime",
      "checkInLat",
      "checkInLon",
      "checkOutLat",
      "checkOutLon",
      "status",
      "method",
    ];

    const csv = exportService.convertToCSV(data, headers);
    return {
      filename: `attendance_${projectId}_${startDate.toISOString().split("T")[0]}.csv`,
      content: csv,
    };
  },

  /**
   * Export tasks as CSV
   */
  exportTasksCSV: async (projectId) => {
    const data = await Task.find({ projectId })
      .select("title description status priority progress startDate endDate createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const headers = [
      "title",
      "description",
      "status",
      "priority",
      "progress",
      "startDate",
      "endDate",
      "createdAt",
    ];

    const csv = exportService.convertToCSV(data, headers);
    return {
      filename: `tasks_${projectId}.csv`,
      content: csv,
    };
  },

  /**
   * Export daily reports as JSON
   */
  exportReportsJSON: async (projectId, startDate, endDate) => {
    const reports = await DailyReport.find({
      projectId,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ createdAt: 1 });

    return {
      filename: `reports_${projectId}_${startDate.toISOString().split("T")[0]}.json`,
      content: JSON.stringify(reports, null, 2),
    };
  },

  /**
   * Generate attendance report summary (JSON)
   */
  generateAttendanceSummary: async (projectId, startDate, endDate) => {
    const data = await Attendance.aggregate([
      {
        $match: {
          projectId: projectId,
          checkInAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: "workers",
          localField: "workerId",
          foreignField: "_id",
          as: "worker",
        },
      },
      {
        $unwind: "$worker",
      },
      {
        $group: {
          _id: "$workerId",
          workerName: {
            $first: {
              $concat: ["$worker.firstname", " ", "$worker.lastname"],
            },
          },
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0],
            },
          },
          absentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          workerId: "$_id",
          workerName: 1,
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          attendanceRate: {
            $multiply: [
              { $divide: ["$presentDays", "$totalDays"] },
              100,
            ],
          },
        },
      },
    ]);

    const summary = {
      projectId,
      period: {
        start: startDate,
        end: endDate,
      },
      workers: data.map((w) => ({
        ...w,
        attendanceRate: w.attendanceRate.toFixed(2),
      })),
      generatedAt: new Date(),
    };

    return {
      filename: `attendance_summary_${projectId}_${startDate.toISOString().split("T")[0]}.json`,
      content: JSON.stringify(summary, null, 2),
    };
  },

  /**
   * Generate project overview report
   */
  generateProjectReport: async (projectId) => {
    const project = await Project.findById(projectId);

    const taskStats = await Task.aggregate([
      {
        $match: { projectId: projectId },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "DONE"] }, 1, 0],
            },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const report = {
      project,
      tasks: taskStats[0] || { total: 0, completed: 0, inProgress: 0 },
      generatedAt: new Date(),
    };

    return {
      filename: `project_report_${projectId}.json`,
      content: JSON.stringify(report, null, 2),
    };
  },

  /**
   * Export worker summary as CSV
   */
  exportWorkerSummaryCSV: async (projectId, startDate, endDate) => {
    const data = await Attendance.aggregate([
      {
        $match: {
          projectId: projectId,
          checkInAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $lookup: {
          from: "workers",
          localField: "workerId",
          foreignField: "_id",
          as: "worker",
        },
      },
      {
        $unwind: "$worker",
      },
      {
        $group: {
          _id: "$workerId",
          name: {
            $first: {
              $concat: ["$worker.firstname", " ", "$worker.lastname"],
            },
          },
          email: { $first: "$worker.email" },
          phone: { $first: "$worker.phone" },
          department: { $first: "$worker.department" },
        },
      },
      {
        $project: {
          workerId: "$_id",
          name: 1,
          email: 1,
          phone: 1,
          department: 1,
        },
      },
    ]);

    const headers = ["workerId", "name", "email", "phone", "department"];

    const csv = exportService.convertToCSV(data, headers);
    return {
      filename: `workers_${projectId}.csv`,
      content: csv,
    };
  },
};
