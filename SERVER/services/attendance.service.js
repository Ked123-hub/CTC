import { db } from "../db/index.js";
import { attendanceTable, projectsTable } from "../models/index.js";
import { geofenceService } from "./geofence.service.js";
import { eq } from "drizzle-orm";

export const checkInWorker = async (data) => {
  // Get project details including geofence configuration
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, data.projectId))
    .limit(1);

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
  const [record] = await db
    .insert(attendanceTable)
    .values({
      ...data,
      checkInAt: new Date(),
      geofenceValidation: geofenceValidation
        ? JSON.stringify(geofenceValidation)
        : null,
    })
    .returning();

  return {
    ...record,
    geofenceValidation,
    project: {
      id: project.id,
      name: project.name,
      location: project.location,
    },
  };
};

export const checkOutWorker = async (id, checkOutLat, checkOutLng) => {
  const [updated] = await db
    .update(attendanceTable)
    .set({
      checkOutAt: new Date(),
      checkOutLat,
      checkOutLng,
      status: "PRESENT",
    })
    .where(eq(attendanceTable.id, id))
    .returning();
  return updated;
};

export const getWorkerAttendance = async (workerId) => {
  const records = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.workerId, workerId));
  return records;
};

export const getProjectAttendance = async (projectId) => {
  const records = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.projectId, projectId));
  return records;
};
