import { useState, useCallback, useRef, useEffect } from "react";
import apiClient from "@/lib/api-client";

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationTrackerState {
  isTracking: boolean;
  currentLocation: LocationCoords | null;
  error: string | null;
  watchId: number | null;
}

export const useLocationTracker = () => {
  const [state, setState] = useState<LocationTrackerState>({
    isTracking: false,
    currentLocation: null,
    error: null,
    watchId: null,
  });

  const geolocationRef = useRef<GeolocationCoordinates | null>(null);

  const startTracking = useCallback(
    async (
      projectId: string,
      workerId: string,
      updateInterval: number = 30000
    ) => {
      if (!navigator.geolocation) {
        setState((prev) => ({
          ...prev,
          error: "Geolocation is not supported by your browser",
        }));
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          isTracking: true,
          error: null,
        }));

        // Get initial position
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const coords = {
              latitude,
              longitude,
              accuracy,
              timestamp: Date.now(),
            };

            geolocationRef.current = position.coords;

            setState((prev) => ({
              ...prev,
              currentLocation: coords,
            }));

            // Send to backend
            try {
              await apiClient.updateLocation({
                projectId,
                workerId,
                latitude,
                longitude,
                accuracy,
                timestamp: new Date().toISOString(),
              });
            } catch (error) {
              console.error("Failed to update location:", error);
            }
          },
          (error) => {
            setState((prev) => ({
              ...prev,
              error: error.message,
              isTracking: false,
            }));
          },
          { enableHighAccuracy: true, timeout: 30000 }
        );

        // Watch location changes
        const watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            const coords = {
              latitude,
              longitude,
              accuracy,
              timestamp: Date.now(),
            };

            geolocationRef.current = position.coords;

            setState((prev) => ({
              ...prev,
              currentLocation: coords,
            }));

            // Send to backend
            try {
              await apiClient.updateLocation({
                projectId,
                workerId,
                latitude,
                longitude,
                accuracy,
                timestamp: new Date().toISOString(),
              });
            } catch (error) {
              console.error("Failed to update location:", error);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 30000,
          }
        );

        setState((prev) => ({
          ...prev,
          watchId,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: (error as Error).message,
          isTracking: false,
        }));
      }
    },
    []
  );

  const stopTracking = useCallback(() => {
    if (state.watchId !== null) {
      navigator.geolocation.clearWatch(state.watchId);
    }

    setState((prev) => ({
      ...prev,
      isTracking: false,
      watchId: null,
    }));
  }, [state.watchId]);

  const validateCheckIn = useCallback(
    async (data: {
      projectId: string;
      workerId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
    }) => {
      try {
        // fetch project to get geofence coordinates
        const projectResp = await apiClient.getProject(data.projectId);
        const project = projectResp.data;

        const payload = {
          checkinLatitude: data.latitude,
          checkinLongitude: data.longitude,
          projectLatitude: project.latitude || 0,
          projectLongitude: project.longitude || 0,
          radiusKm: project.geofenceRadiusKm || 0.5,
        };

        const response = await apiClient.validateCheckIn(payload);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const calculateDistance = useCallback(
    async (
      origin: { latitude: number; longitude: number },
      destination: { latitude: number; longitude: number }
    ) => {
      try {
        const response = await apiClient.calculateDistance(origin, destination);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    []
  );

  return {
    ...state,
    startTracking,
    stopTracking,
    validateCheckIn,
    calculateDistance,
  };
};
