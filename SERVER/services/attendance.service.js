import { Attendance, Project } from "../models/index.js";
import { geofenceService } from "./geofence.service.js";

export const checkInWorker = async (data) => {
  // Get project details including geofence configuration
  const project = await Project.findById(data.projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  // Validate geofence if enabled and enforced
  let geofenceValidation = null;
  if (project.geofenceEnabled && data.checkInLat && data.checkInLng) {
    geofenceValidation = geofenceService.validateCheckInLocation(
      data.checkInLat,
      data.checkInLng,
      project
    );

    // Block check-in if outside geofence and enforcement is enabled
    if (!geofenceValidation.allowed && project.enforceGeofenceOnCheckIn) {
      const error = new Error("Check-in location outside project geofence");
      error.geofenceValidation = geofenceValidation;
      error.statusCode = 403;
      throw error;
    }
  }

  // Proceed with check-in
  const record = new Attendance({
    ...data,
    checkInAt: new Date(),
    geofenceValidation: geofenceValidation || null,
  });

  await record.save();

  return {
    ...record.toObject(),
    geofenceValidation,
    project: {
      id: project._id,
      name: project.name,
      location: project.location,
    },
  };
};

export const checkOutWorker = async (id, checkOutLat, checkOutLng) => {
  const updated = await Attendance.findByIdAndUpdate(
    id,
    {
      checkOutAt: new Date(),
      checkOutLat,
      checkOutLng,
      status: "PRESENT",
    },
    { new: true }
  );

  if (!updated) {
    throw new Error("Attendance record not found");
  }

  return updated;
};

export const getWorkerAttendance = async (workerId) => {
  const records = await Attendance.find({ workerId }).sort({ checkInAt: -1 });
  return records;
};

export const getProjectAttendance = async (projectId) => {
  const records = await Attendance.find({ projectId }).sort({ checkInAt: -1 });
  return records;
};
