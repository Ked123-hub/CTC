import mongoose from "mongoose";

const { Schema } = mongoose;

// Task Assignment Sub-schema
const taskAssignmentSchema = new Schema({
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  roleOnTask: {
    type: String,
    maxlength: 50,
    trim: true
  },
  allocationPercent: {
    type: Number,
    min: 0,
    max: 100
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Task Update Sub-schema
const taskUpdateSchema = new Schema({
  workerId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  progressPercent: {
    type: Number,
    min: 0,
    max: 100
  },
  attachmentUrl: {
    type: String,
    maxlength: 255
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// Main Task Schema
const taskSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    maxlength: 100,
    trim: true
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM"
  },
  plannedStart: {
    type: Date
  },
  plannedEnd: {
    type: Date
  },
  status: {
    type: String,
    enum: ["BACKLOG", "IN_PROGRESS", "DONE", "BLOCKED"],
    default: "BACKLOG"
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  // Embedded assignments and updates
  assignments: [taskAssignmentSchema],
  updates: [taskUpdateSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
taskSchema.index({ projectId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ requiredSkills: 1 });
taskSchema.index({ plannedStart: 1, plannedEnd: 1 });

// Virtual for task duration in days
taskSchema.virtual('durationDays').get(function() {
  if (this.plannedStart && this.plannedEnd) {
    return Math.ceil((this.plannedEnd - this.plannedStart) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for completion percentage based on updates
taskSchema.virtual('currentProgress').get(function() {
  if (this.updates && this.updates.length > 0) {
    // Get the latest progress update
    const latestUpdate = this.updates.sort((a, b) => b.createdAt - a.createdAt)[0];
    return latestUpdate.progressPercent || 0;
  }
  return 0;
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
