import { Notification } from "../models/index.js";

export const notificationService = {
  /**
   * Create a notification
   */
  createNotification: async (workerId, type, payload) => {
    const notification = new Notification({
      workerId,
      type,
      payload,
      readAt: null,
      sentAt: new Date(),
    });

    await notification.save();
    return notification;
  },

  /**
   * Get notifications for a worker
   */
  getNotifications: async (workerId, isRead = null, limit = 20, offset = 0) => {
    const query = { workerId };

    if (isRead !== null) {
      if (isRead) {
        query.readAt = { $ne: null };
      } else {
        query.readAt = null;
      }
    }

    const notifications = await Notification.find(query)
      .sort({ sentAt: -1 })
      .limit(limit)
      .skip(offset);

    return notifications;
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    await Notification.findByIdAndUpdate(notificationId, { readAt: new Date() });
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (workerId) => {
    await Notification.updateMany(
      { workerId, readAt: null },
      { readAt: new Date() }
    );
  },

  /**
   * Get unread count
   */
  getUnreadCount: async (workerId) => {
    const count = await Notification.countDocuments({
      workerId,
      readAt: null,
    });

    return count;
  },

  /**
   * Get count of pending story requests (unread)
   */
  getStoryRequestCount: async () => {
    const count = await Notification.countDocuments({
      type: "GENERAL",
      "payload.category": "STORY_REQUEST",
      readAt: null,
    });

    return count;
  },

  /**
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    await Notification.findByIdAndDelete(notificationId);
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
    const notifications = workerIds.map((workerId) => ({
      workerId,
      type,
      payload,
      readAt: null,
      sentAt: new Date(),
    }));

    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  },
};
