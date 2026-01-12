import mongoose from "mongoose";

const { Schema } = mongoose;

const eventSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  type: {
    type: String,
    enum: ["MEETING", "TRAINING", "INSPECTION", "MAINTENANCE", "SOCIAL", "OTHER"],
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  },
  startAt: {
    type: Date,
    required: true
  },
  endAt: {
    type: Date
  },
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      maxlength: 255
    }
  },
  status: {
    type: String,
    enum: ["PLANNED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
    default: "PLANNED"
  },
  attendees: [{
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker'
    },
    status: {
      type: String,
      enum: ["INVITED", "CONFIRMED", "DECLINED", "ATTENDED"],
      default: "INVITED"
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
eventSchema.index({ projectId: 1 });
eventSchema.index({ startAt: 1, endAt: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1 });

// Virtual for event duration in hours
eventSchema.virtual('durationHours').get(function() {
  if (this.startAt && this.endAt) {
    return (this.endAt - this.startAt) / (1000 * 60 * 60);
  }
  return null;
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
