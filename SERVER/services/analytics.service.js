import {
  Attendance,
  Task,
  Worker,
  Project,
  LeaveRequest,
  DailyReport
} from "../models/index.js";

/**
 * Analytics Service for Field Operations Management
 * Provides metrics, dashboards, and performance insights
 */

export const analyticsService = {
  /**
   * Get attendance statistics for a project
   * @param {string} projectId - Project ObjectId
   * @param {Date} startDate - Start date for period
   * @param {Date} endDate - End date for period
   */
  getAttendanceStats: async (projectId, startDate, endDate) => {
    const stats = await Attendance.aggregate([
      {
        $match: {
          projectId: projectId,
          checkInAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalWorkers: { $addToSet: "$workerId" },
          totalCheckIns: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0]
            }
          },
          absentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0]
            }
          },
          durations: {
            $push: {
              $cond: {
                if: { $and: ["$checkInAt", "$checkOutAt"] },
                then: {
                  $divide: [
                    { $subtract: ["$checkOutAt", "$checkInAt"] },
                    1000 * 60 * 60 // Convert to hours
                  ]
                },
                else: 0
              }
            }
          }
        }
      },
      {
        $project: {
          totalWorkers: { $size: "$totalWorkers" },
          totalCheckIns: 1,
          presentDays: 1,
          absentDays: 1,
          avgDuration: {
            $cond: {
              if: { $gt: [{ $size: "$durations" }, 0] },
              then: { $avg: "$durations" },
              else: 0
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalWorkers: 0,
      totalCheckIns: 0,
      avgDuration: 0,
      presentDays: 0,
      absentDays: 0,
    };
  },

  /**
   * Get per-worker attendance breakdown
   */
  getWorkerAttendanceBreakdown: async (projectId, startDate, endDate) => {
    const data = await Attendance.aggregate([
      {
        $match: {
          projectId: projectId,
          checkInAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: 'workers',
          localField: 'workerId',
          foreignField: '_id',
          as: 'worker'
        }
      },
      {
        $unwind: '$worker'
      },
      {
        $group: {
          _id: '$workerId',
          workerName: {
            $first: {
              $concat: ['$worker.firstname', ' ', '$worker.lastname']
            }
          },
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0]
            }
          },
          absentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0]
            }
          },
          durations: {
            $push: {
              $cond: {
                if: { $and: ["$checkInAt", "$checkOutAt"] },
                then: {
                  $divide: [
                    { $subtract: ["$checkOutAt", "$checkInAt"] },
                    1000 * 60 * 60
                  ]
                },
                else: 0
              }
            }
          }
        }
      },
      {
        $project: {
          workerId: '$_id',
          workerName: 1,
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          avgHours: {
            $cond: {
              if: { $gt: [{ $size: "$durations" }, 0] },
              then: { $avg: "$durations" },
              else: 0
            }
          }
        }
      },
      {
        $sort: { avgHours: -1 }
      }
    ]);

    return data;
  },

  /**
   * Get task completion metrics
   */
  getTaskMetrics: async (projectId) => {
    const stats = await Task.aggregate([
      {
        $match: { projectId: projectId }
      },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: {
              $cond: [
                { $in: ["$status", ["DONE", "COMPLETED"]] },
                1,
                0
              ]
            }
          },
          inProgressTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "IN_PROGRESS"] }, 1, 0]
            }
          },
          blockedTasks: {
            $sum: {
              $cond: [{ $eq: ["$status", "BLOCKED"] }, 1, 0]
            }
          },
          backlogTasks: {
            $sum: {
              $cond: [
                { $in: ["$status", ["BACKLOG", "PENDING"]] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      blockedTasks: 0,
      backlogTasks: 0
    };

    const total = result.totalTasks;
    result.avgProgress = total > 0 ? Math.round((result.completedTasks / total) * 100) : 0;
    result.completionRate = total > 0 ? ((result.completedTasks / total) * 100).toFixed(2) : "0.00";

    return result;
  },

  /**
   * Get leave statistics for a period
   */
  getLeaveStats: async (startDate, endDate) => {
    const stats = await LeaveRequest.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          approvedLeaves: {
            $sum: {
              $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0]
            }
          },
          pendingLeaves: {
            $sum: {
              $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0]
            }
          },
          rejectedLeaves: {
            $sum: {
              $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalRequests: 0,
      approvedLeaves: 0,
      pendingLeaves: 0,
      rejectedLeaves: 0,
    };
  },

  /**
   * Get project progress overview
   */
  getProjectProgress: async (projectId) => {
    const project = await Project.findById(projectId);

    const [taskStats, attendanceStats] = await Promise.all([
      Task.aggregate([
        { $match: { projectId: projectId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ["$status", "DONE"] }, 1, 0]
              }
            }
          }
        }
      ]),
      Attendance.aggregate([
        { $match: { projectId: projectId } },
        {
          $group: {
            _id: null,
            uniqueWorkers: { $addToSet: "$workerId" }
          }
        },
        {
          $project: {
            uniqueWorkers: { $size: "$uniqueWorkers" }
          }
        }
      ])
    ]);

    const tasks = taskStats[0] || { total: 0, completed: 0 };
    const attendance = attendanceStats[0] || { uniqueWorkers: 0 };

    return {
      ...project.toObject(),
      taskCompletionRate: tasks.total > 0
        ? ((tasks.completed / tasks.total) * 100).toFixed(2)
        : 0,
      completedTasks: tasks.completed,
      totalTasks: tasks.total,
      activeWorkers: attendance.uniqueWorkers,
    };
  },

  /**
   * Get daily reports summary
   */
  getDailyReportsSummary: async (projectId, startDate, endDate) => {
    const reports = await DailyReport.aggregate([
      {
        $match: {
          projectId: projectId,
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { date: -1 } }
    ]);

    return reports;
  },

  /**
   * Get dashboard overview for a project
   */
  getDashboardOverview: async (projectId) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      projectProgress,
      taskMetrics,
      attendanceStats,
      leaveStats,
      dailyReportsSummary,
    ] = await Promise.all([
      this.getProjectProgress(projectId),
      this.getTaskMetrics(projectId),
      this.getAttendanceStats(projectId, thirtyDaysAgo, today),
      this.getLeaveStats(thirtyDaysAgo, today),
      this.getDailyReportsSummary(projectId, thirtyDaysAgo, today),
    ]);

    return {
      project: projectProgress,
      tasks: taskMetrics,
      attendance: attendanceStats,
      leaves: leaveStats,
      reports: dailyReportsSummary,
    };
  },

  /**
   * Get worker performance metrics
   */
  getWorkerPerformance: async (workerId) => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const attendanceData = await Attendance.aggregate([
      {
        $match: {
          workerId: workerId,
          checkInAt: {
            $gte: thirtyDaysAgo,
            $lte: today
          }
        }
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0]
            }
          },
          durations: {
            $push: {
              $cond: {
                if: { $and: ["$checkInAt", "$checkOutAt"] },
                then: {
                  $divide: [
                    { $subtract: ["$checkOutAt", "$checkInAt"] },
                    1000 * 60 * 60
                  ]
                },
                else: 0
              }
            }
          }
        }
      },
      {
        $project: {
          totalDays: 1,
          presentDays: 1,
          avgHours: {
            $cond: {
              if: { $gt: [{ $size: "$durations" }, 0] },
              then: { $avg: "$durations" },
              else: 0
            }
          }
        }
      }
    ]);

    const data = attendanceData[0] || { totalDays: 0, presentDays: 0, avgHours: 0 };

    return {
      workerId,
      attendanceRate: data.totalDays > 0
        ? ((data.presentDays / data.totalDays) * 100).toFixed(2)
        : 0,
      avgHoursPerDay: data.avgHours.toFixed(2),
      ...data,
    };
  },

  /**
   * Get analytics for all projects
   */
  getAllProjectsOverview: async (startDate, endDate) => {
    const projects = await Project.find({}).lean();

    const projectsData = await Promise.all(
      projects.map(async (project) => {
        const [taskStats, attendanceStats, reportCount] = await Promise.all([
          // Task metrics
          Task.aggregate([
            { $match: { projectId: project._id } },
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: {
                  $sum: {
                    $cond: [
                      { $in: ["$status", ["DONE", "COMPLETED"]] },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]),
          // Attendance metrics
          Attendance.aggregate([
            {
              $match: {
                projectId: project._id,
                checkInAt: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $group: {
                _id: null,
                totalWorkers: { $addToSet: "$workerId" },
                totalCheckIns: { $sum: 1 }
              }
            },
            {
              $project: {
                totalWorkers: { $size: "$totalWorkers" },
                totalCheckIns: 1
              }
            }
          ]),
          // Daily reports count
          DailyReport.countDocuments({
            projectId: project._id,
            createdAt: { $gte: startDate, $lte: endDate }
          })
        ]);

        const tasks = taskStats[0] || { totalTasks: 0, completedTasks: 0 };
        const attendance = attendanceStats[0] || { totalWorkers: 0, totalCheckIns: 0 };

        return {
          projectId: project._id,
          projectName: project.name,
          projectLocation: project.location,
          projectStatus: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          totalTasks: tasks.totalTasks,
          completedTasks: tasks.completedTasks,
          taskCompletionRate: tasks.totalTasks > 0
            ? ((tasks.completedTasks / tasks.totalTasks) * 100).toFixed(2)
            : 0,
          activeWorkers: attendance.totalWorkers,
          totalCheckIns: attendance.totalCheckIns,
          dailyReportsCount: reportCount,
        };
      })
    );

    return projectsData;
  },
};
