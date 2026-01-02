import { db } from "../db/index.js";
import {
  attendanceTable,
  workersTable,
  projectsTable,
} from "../models/index.js";
import { eq } from "drizzle-orm";
import { redisService, getRedisClient } from "./redis.service.js";
import { geofenceService } from "./geofence.service.js";
import { googleMapsService } from "./google-maps.service.js";
import { geofenceAlertService } from "./geofence-alert.service.js";

/**
 * Real-time Location Tracking Service (Redis-backed)
 * Handles live location updates, active worker visibility, and geofencing
 */

export const locationTrackingService = {
  /**
   * Update worker's real-time location with geofence validation
   */
  updateWorkerLocation: async (
    workerId,
    latitude,
    longitude,
    projectId,
    accuracy = null
  ) => {
    try {
      // Get previous location for boundary crossing detection
      const previousLocation = await redisService.getWorkerLocation(
        workerId,
        projectId
      );

      const location = {
        latitude,
        longitude,
        accuracy,
      };

      // Store in Redis with expiration
      const cached = await redisService.setWorkerLocation(
        workerId,
        projectId,
        location
      );

      // Get project details for geofence monitoring
      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, projectId))
        .limit(1);

      // Get worker details for alerts
      const [worker] = await db
        .select()
        .from(workersTable)
        .where(eq(workersTable.id, workerId))
        .limit(1);

      // Check for boundary crossings and generate alerts
      let alertsResult = null;
      if (
        project &&
        worker &&
        previousLocation &&
        project.alertOnGeofenceBreach
      ) {
        alertsResult = await geofenceAlertService.processLocationUpdate(
          workerId,
          `${worker.firstname} ${worker.lastname}`,
          previousLocation.latitude,
          previousLocation.longitude,
          latitude,
          longitude,
          project
        );
      }

      // Also store in database for history
      await db
        .update(attendanceTable)
        .set({
          checkOutLat: latitude.toString(),
          checkOutLng: longitude.toString(),
          updatedAt: new Date(),
        })
        .where(eq(attendanceTable.workerId, workerId));

      return {
        success: true,
        message: "Location updated",
        location: cached,
        alerts: alertsResult,
      };
    } catch (error) {
      console.error("Location update error:", error);
      throw error;
    }
  },

  /**
   * Get all active workers on a project with details
   */
  getActiveWorkersOnProject: async (projectId) => {
    try {
      const activeWorkers = await redisService.getActiveWorkersOnProject(
        projectId
      );

      // Enrich with worker details from database
      const enrichedWorkers = await Promise.all(
        activeWorkers.map(async (activeWorker) => {
          const [workerData] = await db
            .select({
              firstname: workersTable.firstname,
              lastname: workersTable.lastname,
              email: workersTable.email,
              phone: workersTable.phone,
              role: workersTable.role,
              department: workersTable.department,
            })
            .from(workersTable)
            .where(eq(workersTable.id, activeWorker.workerId));

          return {
            ...activeWorker,
            firstname: workerData?.firstname || "Unknown",
            lastname: workerData?.lastname || "User",
            fullName: `${workerData?.firstname} ${workerData?.lastname}`,
            email: workerData?.email,
            phone: workerData?.phone,
            role: workerData?.role,
            department: workerData?.department,
          };
        })
      );

      return enrichedWorkers;
    } catch (error) {
      console.error("Get active workers error:", error);
      throw error;
    }
  },

  /**
   * Get worker's current location
   */
  getWorkerLocation: async (workerId, projectId) => {
    try {
      return await redisService.getWorkerLocation(workerId, projectId);
    } catch (error) {
      console.error("Get worker location error:", error);
      throw error;
    }
  },

  /**
   * Mark worker as inactive after check-out
   */
  markWorkerInactive: async (workerId, projectId) => {
    try {
      await redisService.removeWorkerLocation(workerId, projectId);
      return {
        success: true,
        message: "Worker marked as inactive",
      };
    } catch (error) {
      console.error("Mark inactive error:", error);
      throw error;
    }
  },

  /**
   * Validate worker location within project geofence
   */
  validateGeofence: async (
    workerId,
    latitude,
    longitude,
    projectId,
    radiusKm = 0.5
  ) => {
    try {
      // Fetch project from DB
      const [project] = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, projectId))
        .limit(1);

      if (!project) {
        return {
          isInside: false,
          reason: "Project not found",
          workerId,
          projectId,
          timestamp: new Date().toISOString(),
        };
      }

      // If project has primary coordinates, check against them
      let check = { isInside: false };

      if (project.latitude && project.longitude) {
        check = geofenceService.isWithinGeofence(
          latitude,
          longitude,
          parseFloat(project.latitude),
          parseFloat(project.longitude),
          project.geofenceRadiusKm || radiusKm
        );
      }

      // If not inside primary and zones exist, check any zone
      if (!check.isInside && project.geofenceZones && project.geofenceZones.length > 0) {
        const zoneCheck = geofenceService.isWithinAnyZone(
          latitude,
          longitude,
          project.geofenceZones
        );
        // zoneCheck contains matchedZones and isInside
        check = zoneCheck.closestZone ? { isInside: true, ...zoneCheck.closestZone } : { isInside: false, ...zoneCheck };
      }

      // Cache negative checks to reduce repeated computation
      if (!check.isInside) {
        await redisService.setCachedGeofenceCheck(workerId, projectId, check);
      }

      return {
        ...check,
        workerId,
        projectId,
        projectName: project.name,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Geofence validation error:", error);
      throw error;
    }
  },

  /**
   * Get distance between worker and project location
   */
  getDistanceToProject: async (
    latitude,
    longitude,
    projectLatitude,
    projectLongitude
  ) => {
    try {
      const distance = await googleMapsService.getDistance(
        { latitude, longitude },
        { latitude: projectLatitude, longitude: projectLongitude }
      );

      return distance;
    } catch (error) {
      console.error("Distance calculation error:", error);
      throw error;
    }
  },

  /**
   * Get active workers count on project
   */
  getActiveWorkersCount: async (projectId) => {
    try {
      const workers = await redisService.getActiveWorkersOnProject(projectId);
      return workers.length;
    } catch (error) {
      console.error("Get count error:", error);
      throw error;
    }
  },

  /**
   * Get all active workers across all projects
   */
  getAllActiveWorkers: async () => {
    try {
      // Get all location keys from Redis
      const client = getRedisClient();

      // If Redis is not available, return empty array
      if (!client) {
        return [];
      }

      const keys = await client.keys("location:*");

      const workers = [];
      for (const key of keys) {
        const data = await client.get(key);
        if (data) {
          workers.push(JSON.parse(data));
        }
      }

      return workers;
    } catch (error) {
      console.error("Get all active workers error:", error);
      // Return empty array instead of throwing to prevent 500 errors
      return [];
    }
  },

  /**
   * Create geofence alert when worker enters/exits zone
   */
  createGeofenceAlert: async (worker, zone, eventType) => {
    const alert = geofenceService.createGeofenceAlert(
      worker,
      zone,
      eventType,
      "BOUNDARY_ALERT"
    );

    // Store alert in Redis for real-time processing
    // You can emit this via WebSocket for live notifications
    return alert;
  },

  /**
   * Get location history from database
   */
  getLocationHistory: async (workerId, projectId, hoursBack = 24) => {
    try {
      const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

      const records = await db.select().from(attendanceTable).where(
        eq(attendanceTable.workerId, workerId),
        eq(attendanceTable.projectId, projectId)
        // Add createdAt filter (you may need to adjust based on your schema)
      );

      return records.map((r) => ({
        checkInAt: r.checkInAt,
        checkInLat: parseFloat(r.checkInLat),
        checkInLng: parseFloat(r.checkInLng),
        checkOutAt: r.checkOutAt,
        checkOutLat: parseFloat(r.checkOutLat),
        checkOutLng: parseFloat(r.checkOutLng),
      }));
    } catch (error) {
      console.error("Get history error:", error);
      throw error;
    }
  },

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  },

  /**
   * Check if worker is within geofence radius
   */
  isWithinGeofence: (
    workerLat,
    workerLon,
    fenceLat,
    fenceLon,
    radiusKm = 0.5
  ) => {
    const distance = locationTrackingService.calculateDistance(
      workerLat,
      workerLon,
      fenceLat,
      fenceLon
    );
    return distance <= radiusKm;
  },

  /**
   * Validate attendance check-in within geofence
   */
  validateCheckInLocation: (
    checkinLat,
    checkinLon,
    projectLat,
    projectLon,
    radiusKm = 0.5
  ) => {
    const isValid = locationTrackingService.isWithinGeofence(
      checkinLat,
      checkinLon,
      projectLat,
      projectLon,
      radiusKm
    );

    return {
      isValid,
      message: isValid
        ? "Check-in location verified"
        : `Check-in outside geofence. Distance: ${locationTrackingService.calculateDistance(
            checkinLat,
            checkinLon,
            projectLat,
            projectLon
          ).toFixed(2)}km`,
    };
  },
};
