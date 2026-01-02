import { db } from "../db/index.js";
import {
  attendanceTable,
  tasksTable,
  workersTable,
  projectsTable,
  dailyReportsTable,
} from "../models/index.js";
import { eq, and, gte, lte } from "drizzle-orm";

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
   * Export attendanceTable data as CSV
   */
  exportAttendanceCSV: async (projectId, startDate, endDate) => {
    const data = await db
      .select({
        workerId: attendanceTable.workerId,
        workerName: db.sql`CONCAT(${workersTable.firstname}, ' ', ${workersTable.lastname})`,
        checkInTime: attendanceTable.checkInAt,
        checkOutTime: attendanceTable.checkOutAt,
        checkInLat: attendanceTable.checkInLat,
        checkInLon: attendanceTable.checkInLng,
        checkOutLat: attendanceTable.checkOutLat,
        checkOutLon: attendanceTable.checkOutLng,
        status: attendanceTable.status,
        method: attendanceTable.method,
      })
      .from(attendanceTable)
      .leftJoin(workersTable, eq(attendanceTable.workerId, workersTable.id))
      .where(
        and(
          eq(attendanceTable.projectId, projectId),
          gte(attendanceTable.checkInAt, startDate),
          lte(attendanceTable.checkInAt, endDate)
        )
      )
      .orderBy(attendanceTable.checkInAt);

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
      filename: `attendance_${projectId}_${
        startDate.toISOString().split("T")[0]
      }.csv`,
      content: csv,
    };
  },

  /**
   * Export tasksTable as CSV
   */
  exportTasksCSV: async (projectId) => {
    const data = await db
      .select({
        id: tasksTable.id,
        title: tasksTable.title,
        description: tasksTable.description,
        status: tasksTable.status,
        priority: tasksTable.priority,
        progress: tasksTable.progress,
        startDate: tasksTable.startDate,
        endDate: tasksTable.endDate,
        createdAt: tasksTable.createdAt,
      })
      .from(tasksTable)
      .where(eq(tasksTable.projectId, projectId))
      .orderBy(tasksTable.createdAt);

    const headers = [
      "id",
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
    const reports = await db
      .select()
      .from(dailyReportsTable)
      .where(
        and(
          eq(dailyReportsTable.projectId, projectId),
          gte(dailyReportsTable.createdAt, startDate),
          lte(dailyReportsTable.createdAt, endDate)
        )
      )
      .orderBy(dailyReportsTable.createdAt);

    return {
      filename: `reports_${projectId}_${
        startDate.toISOString().split("T")[0]
      }.json`,
      content: JSON.stringify(reports, null, 2),
    };
  },

  /**
   * Generate attendanceTable report summary (HTML/JSON)
   */
  generateAttendanceSummary: async (projectId, startDate, endDate) => {
    const data = await db
      .select({
        workerId: attendanceTable.workerId,
        workerName: db.sql`CONCAT(${workersTable.firstname}, ' ', ${workersTable.lastname})`,
        totalDays: db.sql`COUNT(*)`,
        presentDays: db.sql`COUNT(CASE WHEN ${attendanceTable.status} = 'PRESENT' THEN 1 END)`,
        absentDays: db.sql`COUNT(CASE WHEN ${attendanceTable.status} = 'ABSENT' THEN 1 END)`,
      })
      .from(attendanceTable)
      .leftJoin(workersTable, eq(attendanceTable.workerId, workersTable.id))
      .where(
        and(
          eq(attendanceTable.projectId, projectId),
          gte(attendanceTable.checkInAt, startDate),
          lte(attendanceTable.checkInAt, endDate)
        )
      )
      .groupBy(attendanceTable.workerId, workersTable.id);

    const summary = {
      projectId,
      period: {
        start: startDate,
        end: endDate,
      },
      workersTable: data.map((w) => ({
        ...w,
        attendanceRate: ((w.presentDays / w.totalDays) * 100).toFixed(2),
      })),
      generatedAt: new Date(),
    };

    return {
      filename: `attendance_summary_${projectId}_${
        startDate.toISOString().split("T")[0]
      }.json`,
      content: JSON.stringify(summary, null, 2),
    };
  },

  /**
   * Generate project overview report
   */
  generateProjectReport: async (projectId) => {
    const projectData = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    const taskData = await db
      .select({
        total: db.sql`COUNT(*)`,
        completed: db.sql`COUNT(CASE WHEN ${tasksTable.status} = 'DONE' THEN 1 END)`,
        inProgress: db.sql`COUNT(CASE WHEN ${tasksTable.status} = 'IN_PROGRESS' THEN 1 END)`,
      })
      .from(tasksTable)
      .where(eq(tasksTable.projectId, projectId));

    const report = {
      project: projectData[0],
      tasksTable: taskData[0],
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
    const data = await db
      .select({
        workerId: workersTable.id,
        name: db.sql`CONCAT(${workersTable.firstname}, ' ', ${workersTable.lastname})`,
        email: workersTable.email,
        phone: workersTable.phone,
        department: workersTable.department,
      })
      .from(workersTable)
      .leftJoin(attendanceTable, eq(workersTable.id, attendanceTable.workerId))
      .where(
        and(
          eq(attendanceTable.projectId, projectId),
          gte(attendanceTable.checkInAt, startDate),
          lte(attendanceTable.checkInAt, endDate)
        )
      )
      .groupBy(workersTable.id);

    const headers = ["workerId", "name", "email", "phone", "department"];

    const csv = exportService.convertToCSV(data, headers);
    return {
      filename: `workers_${projectId}.csv`,
      content: csv,
    };
  },
};
