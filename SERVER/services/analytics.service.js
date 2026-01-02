import { db } from "../db/index.js";
import {
  attendanceTable,
  tasksTable,
  workersTable,
  projectsTable,
  leaveRequestsTable,
  dailyReportsTable,
} from "../models/index.js";
import { eq, and, gte, lte, sql, count, avg } from "drizzle-orm";

/**
 * Analytics Service for Field Operations Management
 * Provides metrics, dashboards, and performance insights
 */

export const analyticsService = {
  /**
   * Get attendance statistics for a project
   * @param {string} projectId - Project UUID
   * @param {Date} startDate - Start date for period
   * @param {Date} endDate - End date for period
   */
  getAttendanceStats: async (projectId, startDate, endDate) => {
    const stats = await db
      .select({
        totalWorkers: count(sql`DISTINCT ${attendanceTable.workerId}`),
        totalCheckIns: count(),
        avgDuration: avg(
          sql`EXTRACT(EPOCH FROM (COALESCE(${attendanceTable.checkOutAt}, NOW()) - ${attendanceTable.checkInAt})) / 3600`
        ),
        presentDays: count(
          sql`CASE WHEN ${attendanceTable.status} = 'PRESENT' THEN 1 END`
        ),
        absentDays: count(
          sql`CASE WHEN ${attendanceTable.status} = 'ABSENT' THEN 1 END`
        ),
      })
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.projectId, projectId),
          gte(attendanceTable.checkInAt, startDate),
          lte(attendanceTable.checkInAt, endDate)
        )
      );

    return (
      stats[0] || {
        totalWorkers: 0,
        totalCheckIns: 0,
        avgDuration: 0,
        presentDays: 0,
        absentDays: 0,
      }
    );
  },

  /**
   * Get per-worker attendance breakdown
   */
  getWorkerAttendanceBreakdown: async (projectId, startDate, endDate) => {
    const data = await db
      .select({
        workerId: attendanceTable.workerId,
        workerName: sql`CONCAT(${workersTable.firstname}, ' ', ${workersTable.lastname})`,
        totalDays: count(),
        presentDays: count(
          sql`CASE WHEN ${attendanceTable.status} = 'PRESENT' THEN 1 END`
        ),
        absentDays: count(
          sql`CASE WHEN ${attendanceTable.status} = 'ABSENT' THEN 1 END`
        ),
        avgHours: avg(
          sql`EXTRACT(EPOCH FROM (COALESCE(${attendanceTable.checkOutAt}, NOW()) - ${attendanceTable.checkInAt})) / 3600`
        ),
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

    return data;
  },

  /**
   * Get task completion metrics
   */
  getTaskMetrics: async (projectId) => {
    const stats = await db
      .select({
        totalTasks: count(),
        completedTasks: count(
          sql`CASE WHEN ${tasksTable.status} = 'DONE' OR ${tasksTable.status} = 'COMPLETED' THEN 1 END`
        ),
        inProgressTasks: count(
          sql`CASE WHEN ${tasksTable.status} = 'IN_PROGRESS' THEN 1 END`
        ),
        blockedTasks: count(
          sql`CASE WHEN ${tasksTable.status} = 'BLOCKED' THEN 1 END`
        ),
        backlogTasks: count(
          sql`CASE WHEN ${tasksTable.status} = 'BACKLOG' OR ${tasksTable.status} = 'PENDING' THEN 1 END`
        ),
      })
      .from(tasksTable)
      .where(eq(tasksTable.projectId, projectId));

    const total = stats[0]?.totalTasks || 0;
    const completed = stats[0]?.completedTasks || 0;

    return {
      ...stats[0],
      avgProgress: total > 0 ? Math.round((completed / total) * 100) : 0,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
    };
  },

  /**
   * Get leave statistics for a period
   */
  getLeaveStats: async (startDate, endDate) => {
    const stats = await db
      .select({
        totalRequests: count(),
        approvedLeaves: count(
          sql`CASE WHEN ${leaveRequestsTable.status} = 'APPROVED' THEN 1 END`
        ),
        pendingLeaves: count(
          sql`CASE WHEN ${leaveRequestsTable.status} = 'PENDING' THEN 1 END`
        ),
        rejectedLeaves: count(
          sql`CASE WHEN ${leaveRequestsTable.status} = 'REJECTED' THEN 1 END`
        ),
      })
      .from(leaveRequestsTable)
      .where(
        and(
          gte(leaveRequestsTable.createdAt, startDate),
          lte(leaveRequestsTable.createdAt, endDate)
        )
      );

    return (
      stats[0] || {
        totalRequests: 0,
        approvedLeaves: 0,
        pendingLeaves: 0,
        rejectedLeaves: 0,
      }
    );
  },

  /**
   * Get project progress overview
   */
  getProjectProgress: async (projectId) => {
    const projectData = await db
      .select({
        name: projectsTable.name,
        status: projectsTable.status,
        startDate: projectsTable.startDate,
        endDate: projectsTable.endDate,
      })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    const tasksData = await db
      .select({
        total: count(),
        completed: count(
          sql`CASE WHEN ${tasksTable.status} = 'DONE' THEN 1 END`
        ),
      })
      .from(tasksTable)
      .where(eq(tasksTable.projectId, projectId));

    const attendanceData = await db
      .select({
        uniqueWorkers: count(sql`DISTINCT ${attendanceTable.workerId}`),
      })
      .from(attendanceTable)
      .where(eq(attendanceTable.projectId, projectId));

    const project = projectData[0] || {};
    const taskStats = tasksData[0] || { total: 0, completed: 0 };
    const attendanceStats = attendanceData[0] || { uniqueWorkers: 0 };

    return {
      ...project,
      taskCompletionRate:
        taskStats.total > 0
          ? ((taskStats.completed / taskStats.total) * 100).toFixed(2)
          : 0,
      completedTasks: taskStats.completed,
      totalTasks: taskStats.total,
      activeWorkers: attendanceStats.uniqueWorkers,
    };
  },

  /**
   * Get daily reports summary
   */
  getDailyReportsSummary: async (projectId, startDate, endDate) => {
    const reports = await db
      .select({
        date: sql`DATE(${dailyReportsTable.createdAt})`,
        count: count(),
      })
      .from(dailyReportsTable)
      .where(
        and(
          eq(dailyReportsTable.projectId, projectId),
          gte(dailyReportsTable.createdAt, startDate),
          lte(dailyReportsTable.createdAt, endDate)
        )
      )
      .groupBy(sql`DATE(${dailyReportsTable.createdAt})`);

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
      analyticsService.getProjectProgress(projectId),
      analyticsService.getTaskMetrics(projectId),
      analyticsService.getAttendanceStats(projectId, thirtyDaysAgo, today),
      analyticsService.getLeaveStats(thirtyDaysAgo, today),
      analyticsService.getDailyReportsSummary(projectId, thirtyDaysAgo, today),
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

    const attendanceData = await db
      .select({
        totalDays: count(),
        presentDays: count(
          sql`CASE WHEN ${attendanceTable.status} = 'PRESENT' THEN 1 END`
        ),
        avgHours: avg(
          sql`EXTRACT(EPOCH FROM (COALESCE(${attendanceTable.checkOutAt}, NOW()) - ${attendanceTable.checkInAt})) / 3600`
        ),
      })
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.workerId, workerId),
          gte(attendanceTable.checkInAt, thirtyDaysAgo),
          lte(attendanceTable.checkInAt, today)
        )
      );

    return {
      workerId,
      attendanceRate:
        (attendanceData[0]?.totalDays || 0) > 0
          ? (
              ((attendanceData[0]?.presentDays || 0) /
                (attendanceData[0]?.totalDays || 1)) *
              100
            ).toFixed(2)
          : 0,
      avgHoursPerDay: attendanceData[0]?.avgHours?.toFixed(2) || 0,
      ...attendanceData[0],
    };
  },

  /**
   * Get analytics for all projects
   */
  getAllProjectsOverview: async (startDate, endDate) => {
    // Get all projects with their basic info and metrics
    const projectsWithMetrics = await db
      .select({
        projectId: projectsTable.id,
        projectName: projectsTable.name,
        projectLocation: projectsTable.location,
        projectStatus: projectsTable.status,
        startDate: projectsTable.startDate,
        endDate: projectsTable.endDate,
      })
      .from(projectsTable);

    // For each project, get aggregated metrics and assigned workers
    const projectsData = await Promise.all(
      projectsWithMetrics.map(async (project) => {
        const [taskStats, attendanceStats, reportCount, assignedWorkers] =
          await Promise.all([
            // Task metrics
            db
              .select({
                totalTasks: count(),
                completedTasks: count(
                  sql`CASE WHEN ${tasksTable.status} = 'DONE' OR ${tasksTable.status} = 'COMPLETED' THEN 1 END`
                ),
              })
              .from(tasksTable)
              .where(eq(tasksTable.projectId, project.projectId)),

            // Attendance metrics
            db
              .select({
                totalWorkers: count(sql`DISTINCT ${attendanceTable.workerId}`),
                totalCheckIns: count(),
              })
              .from(attendanceTable)
              .where(
                and(
                  eq(attendanceTable.projectId, project.projectId),
                  gte(attendanceTable.checkInAt, startDate),
                  lte(attendanceTable.checkInAt, endDate)
                )
              ),

            // Daily reports count
            db
              .select({
                count: count(),
              })
              .from(dailyReportsTable)
              .where(
                and(
                  eq(dailyReportsTable.projectId, project.projectId),
                  gte(dailyReportsTable.createdAt, startDate),
                  lte(dailyReportsTable.createdAt, endDate)
                )
              ),

            // Get assigned workers
            db
              .select({
                id: workersTable.id,
                name: sql`CONCAT(${workersTable.firstname}, ' ', ${workersTable.lastname})`,
                role: workersTable.role,
              })
              .from(attendanceTable)
              .leftJoin(
                workersTable,
                eq(attendanceTable.workerId, workersTable.id)
              )
              .where(eq(attendanceTable.projectId, project.projectId))
              .groupBy(workersTable.id),
          ]);

        const tasks = taskStats[0] || { totalTasks: 0, completedTasks: 0 };
        const attendance = attendanceStats[0] || {
          totalWorkers: 0,
          totalCheckIns: 0,
        };
        const reports = reportCount[0] || { count: 0 };

        return {
          ...project,
          totalTasks: tasks.totalTasks,
          completedTasks: tasks.completedTasks,
          taskCompletionRate:
            tasks.totalTasks > 0
              ? ((tasks.completedTasks / tasks.totalTasks) * 100).toFixed(2)
              : 0,
          activeWorkers: attendance.totalWorkers,
          totalCheckIns: attendance.totalCheckIns,
          dailyReportsCount: reports.count,
          assignedWorkers: assignedWorkers || [],
        };
      })
    );

    return projectsData;
  },
};
