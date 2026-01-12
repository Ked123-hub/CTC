import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema({
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  type: {
    type: String,
    enum: [
      "TASK_ASSIGNED",
      "TASK_COMPLETED",
      "LEAVE_APPROVED",
      "LEAVE_REJECTED",
      "SHIFT_SCHEDULED",
      "PROJECT_UPDATE",
      "GEOFENCE_BREACH",
      "GENERAL_ANNOUNCEMENT"
    ],
    required: true,
    maxlength: 100
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  payload: {
    type: Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
    default: "MEDIUM"
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
notificationSchema.index({ workerId: 1, sentAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ sentAt: 1 });

// Virtual for time since sent
notificationSchema.virtual('timeAgo').get(function() {
  if (!this.sentAt) return null;
  const now = new Date();
  const diffMs = now - this.sentAt;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
