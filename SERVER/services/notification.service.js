import { db } from "../db/index.js";
import { notificationsTable, workersTable } from "../models/index.js";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const notificationService = {
  /**
   * Create a notification
   */
  createNotification: async (workerId, type, payload) => {
    const notification = await db.insert(notificationsTable).values({
      id: uuidv4(),
      workerId,
      type,
      payload,
      // use readAt column; null = unread
      readAt: null,
      sentAt: new Date(),
    });

    return notification;
  },

  /**
   * Get notificationsTable for a worker
   */
  getNotifications: async (workerId, isRead = null, limit = 20, offset = 0) => {
    const whereConditions = [eq(notificationsTable.workerId, workerId)];

    if (isRead !== null) {
      if (isRead) {
        whereConditions.push(db.sql`${notificationsTable.readAt} IS NOT NULL`);
      } else {
        whereConditions.push(db.sql`${notificationsTable.readAt} IS NULL`);
      }
    }

    const notificationList = await db
      .select()
      .from(notificationsTable)
      .where(and(...whereConditions))
      .orderBy(desc(notificationsTable.sentAt))
      .limit(limit)
      .offset(offset);

    return notificationList;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    await db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(eq(notificationsTable.id, notificationId));
  },

  /**
   * Mark all notificationsTable as read
   */
  markAllAsRead: async (workerId) => {
    await db
      .update(notificationsTable)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationsTable.workerId, workerId),
          db.sql`${notificationsTable.readAt} IS NULL`
        )
      );
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (workerId) => {
    const result = await db
      .select({ count: notificationsTable.id })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.workerId, workerId),
          db.sql`${notificationsTable.readAt} IS NULL`
        )
      );

    return result[0]?.count || 0;
  },

  /**
   * Get count of pending story requests (unread)
   */
  getStoryRequestCount: async () => {
    const result = await db
      .select({ count: db.sql`COUNT(*)` })
      .from(notificationsTable)
      .where(
        db.sql`${notificationsTable.type} = 'GENERAL' AND ${notificationsTable.payload} ->> 'category' = 'STORY_REQUEST' AND ${notificationsTable.readAt} IS NULL`
      );

    return result[0]?.count || 0;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    await db
      .delete(notificationsTable)
      .where(eq(notificationsTable.id, notificationId));
  },

  /**
   * Send leave approval notification
   */
  notifyLeaveApproval: async (workerId, leaveStatus, approverName) => {
    const message =
      leaveStatus === "APPROVED"
        ? `Your leave request has been approved by ${approverName}`
        : `Your leave request has been rejected by ${approverName}`;

    return notificationService.createNotification(workerId, "LEAVE_STATUS", {
      message,
      status: leaveStatus,
      approver: approverName,
    });
  },

  /**
   * Send task assignment notification
   */
  notifyTaskAssignment: async (workerId, taskName, projectName) => {
    return notificationService.createNotification(workerId, "TASK_ASSIGNMENT", {
      message: `You have been assigned to task "${taskName}" in project "${projectName}"`,
      taskName,
      projectName,
    });
  },

  /**
   * Send shift schedule notification
   */
  notifyShiftSchedule: async (workerId, shiftName, shiftTime) => {
    return notificationService.createNotification(workerId, "SHIFT_SCHEDULED", {
      message: `You are scheduled for shift "${shiftName}" at ${shiftTime}`,
      shiftName,
      shiftTime,
    });
  },

  /**
   * Send attendance reminder
   */
  notifyAttendanceReminder: async (workerId, projectName) => {
    return notificationService.createNotification(workerId, "ATTENDANCE_REMINDER", {
      message: `Don't forget to check in for project "${projectName}"`,
      projectName,
    });
  },

  /**
   * Broadcast notification to multiple workers
   */
  broadcastNotification: async (workerIds, type, payload) => {
    const notificationList = workerIds.map((workerId) => ({
      id: uuidv4(),
      workerId,
      type,
      payload,
      isRead: false,
      sentAt: new Date(),
    }));

    await db.insert(notificationsTable).values(notificationList);

    return notificationList;
  },
};
