import mongoose from "mongoose";

const { Schema } = mongoose;

const workerSchema = new Schema({
  firstname: {
    type: String,
    required: true,
    maxlength: 55,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    maxlength: 55,
    trim: true
  },
  passwordHash: {
    type: String,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    maxlength: 20,
    trim: true
  },
  role: {
    type: String,
    enum: ["ADMIN", "MANAGER", "WORKER", "VOLUNTEER", "VERIFICATION_OFFICER"],
    default: "WORKER",
    required: true
  },
  department: {
    type: String,
    maxlength: 100,
    trim: true
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
    default: "ACTIVE",
    required: true
  },
  profilePictureUrl: {
    type: String,
    maxlength: 255
  },
  skills: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for full name
workerSchema.virtual('fullName').get(function() {
  return `${this.firstname} ${this.lastname}`;
});

// Add index for common queries
workerSchema.index({ email: 1 });
workerSchema.index({ phone: 1 });
workerSchema.index({ role: 1, status: 1 });
workerSchema.index({ skills: 1 });

const Worker = mongoose.model('Worker', workerSchema);

export default Worker;
