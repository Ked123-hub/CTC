import mongoose from "mongoose";

const { Schema } = mongoose;

const shiftSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  recurrenceRule: {
    type: String,
    enum: ["DAILY", "WEEKLY", "MONTHLY", "NONE"],
    default: "NONE"
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
shiftSchema.index({ projectId: 1 });
shiftSchema.index({ startTime: 1, endTime: 1 });

// Virtual for shift duration in hours
shiftSchema.virtual('durationHours').get(function() {
  if (this.startTime && this.endTime) {
    return (this.endTime - this.startTime) / (1000 * 60 * 60);
  }
  return null;
});

const Shift = mongoose.model('Shift', shiftSchema);

export default Shift;
