import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  address: string;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useGeolocation(trackContinuously: boolean = false, interval: number = 10000) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    address: 'Fetching location...',
    accuracy: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  // Use server-side reverse geocode (Google Maps) for better locality resolution.
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const resp = await apiClient.reverseGeocode(lat, lng);
      const data = resp.data || resp;
      // prefer formatted address from backend, fallback to coords
      return data?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Get a single accurate position by sampling multiple readings within a timeout.
  // Returns best reading (lowest accuracy value) or last reading if none have accuracy.
  const getAccuratePosition = async (
    maxSamples = 8,
    timeoutMs = 30000,
    desiredAccuracyMeters = 100
  ): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));

      let samples: GeolocationPosition[] = [];
      let completed = false;

      const onSuccess = (pos: GeolocationPosition) => {
        samples.push(pos);
        // If accuracy is good enough, finish early
        if (pos.coords.accuracy && pos.coords.accuracy <= desiredAccuracyMeters) {
          finish();
        } else if (samples.length >= maxSamples) {
          finish();
        }
      };

      const onError = (err: GeolocationPositionError) => {
        // ignore transient errors but record
        if (!completed) {
          completed = true;
          reject(err);
        }
      };

      const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: timeoutMs,
      });

      const timer = setTimeout(() => {
        finish();
      }, timeoutMs + 500);

      function finish() {
        if (completed) return;
        completed = true;
        navigator.geolocation.clearWatch(watchId);
        clearTimeout(timer);
        if (samples.length === 0) return reject(new Error('No position samples'));
        // choose sample with smallest accuracy
        const best = samples.reduce((a, b) => {
          if (!a.coords.accuracy) return b;
          if (!b.coords.accuracy) return a;
          return a.coords.accuracy <= b.coords.accuracy ? a : b;
        });
        resolve(best);
      }
    });
  };

  const updatePosition = useCallback(async (position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;
    const address = await reverseGeocode(latitude, longitude);

    setState({
      latitude,
      longitude,
      address,
      accuracy,
      loading: false,
      error: null,
      lastUpdated: new Date(),
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState(prev => ({
      ...prev,
      loading: false,
      error: error.message,
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(updatePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    });
  }, [updatePosition, handleError]);

  useEffect(() => {
    getCurrentPosition();

    if (trackContinuously && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(updatePosition, handleError, {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      });

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [trackContinuously, getCurrentPosition, updatePosition, handleError]);

  return { ...state, refresh: getCurrentPosition, getAccuratePosition };
}
// Note: export getAccuratePosition via named export is handled by hook return when used
