import mongoose from "mongoose";

const { Schema } = mongoose;

// Report Item Sub-schema
const reportItemSchema = new Schema({
  category: {
    type: String,
    maxlength: 100,
    trim: true
  },
  metricName: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  metricValue: {
    type: Number
  },
  unit: {
    type: String,
    maxlength: 30,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, { _id: true });

// Main Daily Report Schema
const dailyReportSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  submittedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  summary: {
    type: String,
    trim: true
  },
  issues: {
    type: String,
    trim: true
  },
  risks: {
    type: String,
    trim: true
  },
  needs: {
    type: String,
    trim: true
  },
  weather: {
    condition: {
      type: String,
      enum: ["SUNNY", "CLOUDY", "RAINY", "STORMY", "SNOWY", "WINDY"]
    },
    temperature: {
      type: Number
    },
    temperatureUnit: {
      type: String,
      enum: ["C", "F"],
      default: "C"
    }
  },
  // Embedded report items
  metrics: [reportItemSchema],
  // Additional sections
  accomplishments: [{
    description: String,
    category: String
  }],
  challenges: [{
    description: String,
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    },
    resolution: String
  }],
  nextDayPlan: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
dailyReportSchema.index({ projectId: 1, date: -1 });
dailyReportSchema.index({ submittedBy: 1 });
dailyReportSchema.index({ date: 1 });

// Compound index to ensure one report per project per date
dailyReportSchema.index({ projectId: 1, date: 1 }, { unique: true });

// Virtual for formatted date
dailyReportSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

const DailyReport = mongoose.model('DailyReport', dailyReportSchema);

export default DailyReport;
