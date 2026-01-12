import mongoose from "mongoose";

const { Schema } = mongoose;

const projectSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 120,
    trim: true
  },
  location: {
    type: String,
    maxlength: 255,
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ["ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"],
    default: "ACTIVE",
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  // Project Leader / Manager Assignment
  projectLeaderId: {
    type: Schema.Types.ObjectId,
    ref: 'Worker'
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  // Geofence Configuration
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  geofenceRadiusKm: {
    type: Number,
    default: 0.5,
    min: 0
  },
  geofenceEnabled: {
    type: Boolean,
    default: true
  },
  geofenceZones: [{
    name: String,
    latitude: Number,
    longitude: Number,
    radiusKm: Number
  }],
  enforceGeofenceOnCheckIn: {
    type: Boolean,
    default: true
  },
  alertOnGeofenceBreach: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for common queries
projectSchema.index({ status: 1 });
projectSchema.index({ projectLeaderId: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ requiredSkills: 1 });

// Virtual for project duration in days
projectSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

const Project = mongoose.model('Project', projectSchema);

export default Project;
