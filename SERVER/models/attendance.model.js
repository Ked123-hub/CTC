import mongoose from "mongoose";

const { Schema } = mongoose;

const attendanceSchema = new Schema({
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  shiftId: {
    type: Schema.Types.ObjectId,
    ref: 'Shift'
  },
  checkInAt: {
    type: Date
  },
  checkOutAt: {
    type: Date
  },
  checkInLocation: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  checkOutLocation: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  method: {
    type: String,
    enum: ["MANUAL", "GPS", "QR_CODE", "NFC", "BIOMETRIC"],
    maxlength: 50
  },
  status: {
    type: String,
    enum: ["PENDING", "PRESENT", "ABSENT", "LATE", "EARLY_DEPARTURE"],
    default: "PENDING"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
attendanceSchema.index({ workerId: 1, checkInAt: -1 });
attendanceSchema.index({ projectId: 1, checkInAt: -1 });
attendanceSchema.index({ shiftId: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ checkInAt: 1, checkOutAt: 1 });

// Virtual for duration in hours
attendanceSchema.virtual('durationHours').get(function() {
  if (this.checkInAt && this.checkOutAt) {
    return (this.checkOutAt - this.checkInAt) / (1000 * 60 * 60);
  }
  return null;
});

// Virtual for duration in minutes
attendanceSchema.virtual('durationMinutes').get(function() {
  if (this.checkInAt && this.checkOutAt) {
    return (this.checkOutAt - this.checkInAt) / (1000 * 60);
  }
  return null;
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
