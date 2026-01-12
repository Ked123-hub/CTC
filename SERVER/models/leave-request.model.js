import mongoose from "mongoose";

const { Schema } = mongoose;

const leaveRequestSchema = new Schema({
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  type: {
    type: String,
    enum: ["SICK", "VACATION", "PERSONAL", "MATERNITY", "EMERGENCY", "OTHER"],
    required: true,
    maxlength: 50
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
    default: "PENDING",
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Worker'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
leaveRequestSchema.index({ workerId: 1, createdAt: -1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ approvedBy: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

// Virtual for leave duration in days
leaveRequestSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }
  return null;
});

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;
