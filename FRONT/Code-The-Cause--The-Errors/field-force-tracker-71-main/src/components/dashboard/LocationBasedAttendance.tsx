import { useState } from "react";
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

interface LocationBasedAttendanceProps {
  workerId: string;
  projectId: string;
  geofenceRadius?: number;
}

export const LocationBasedAttendance = ({
  workerId,
  projectId,
  geofenceRadius = 100,
}: LocationBasedAttendanceProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { getAccuratePosition } = useGeolocation();

  const handleCheckIn = async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    // Check if we're on HTTPS or localhost (required for geolocation on mobile)
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isSecure) {
      setError(
        "⚠️ Geolocation requires HTTPS. Please enable location permissions in your browser settings or access via localhost."
      );
      // Still try to get location in case browser allows it
    }

    setIsLoading(true);
    setError(null);

      try {
        // Try to get a sampled accurate position (best of multiple readings)
        let position: GeolocationPosition | null = null;
        try {
          position = await getAccuratePosition(10, 30000, 100);
        } catch (sampleErr) {
          console.warn("getAccuratePosition failed, falling back to getCurrentPosition", sampleErr);
          // fallback to simple getCurrentPosition with longer timeout
          position = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
          });
        }

          const { latitude, longitude, accuracy } = position.coords;

        // If accuracy is poor, show a non-blocking warning but continue
        if (accuracy && accuracy > 200) {
          setError("Low GPS accuracy detected. Location may be imprecise.");
        }

        // Fetch project to obtain geofence coordinates and radius
        const projectResp = await apiClient.getProject(projectId);
        const project = projectResp.data;

        const validationBody = {
          checkinLatitude: latitude,
          checkinLongitude: longitude,
          projectLatitude: project.latitude || 0,
          projectLongitude: project.longitude || 0,
          radiusKm: project.geofenceRadiusKm || geofenceRadius / 1000,
        };

        const validationResponse = await apiClient.validateCheckIn(
          validationBody
        );

        if (validationResponse.data && validationResponse.data.isInside) {
          // Use backend checkIn endpoint field names
          const attendanceResponse = await apiClient.checkIn({
            workerId,
            projectId,
            checkInLat: String(latitude),
            checkInLng: String(longitude),
            method: "GPS",
          });

          setResult({
            success: true,
            message: "Check-in successful",
            data: attendanceResponse.data,
          });
          setError(null);
        } else {
          setError(
            validationResponse.data.message || "Location validation failed"
          );
        }
      } catch (err: any) {
        console.error('Check-in location error:', err);
        setError(err?.message || "Failed to obtain location");
      } finally {
        setIsLoading(false);
      }
  };

    const handleCheckOut = async () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const position = await getAccuratePosition(10, 30000, 100);
        const { latitude, longitude, accuracy } = position.coords;

        if (accuracy && accuracy > 200) {
          setError("Low GPS accuracy detected. Location may be imprecise.");
        }

        // Find the latest attendance record for this worker to get the attendance id
        const attendanceListResp = await apiClient.getAttendance({
          workerId,
        });
        const records = attendanceListResp.data || [];
        // Try to find an active attendance (no checkOutAt). Otherwise take the most recent by checkInAt
        let latest = null;
        if (Array.isArray(records) && records.length) {
          latest = records.find((r: any) => !r.checkOutAt) ||
            records.sort((a: any, b: any) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime())[0];
        }

        const attendanceId = latest ? latest.id : null;

        if (!attendanceId) {
          setError("No active attendance record found to check out");
          setIsLoading(false);
          return;
        }

        const checkoutResp = await apiClient.checkOut(attendanceId, {
          checkOutLat: String(latitude),
          checkOutLng: String(longitude),
        });

        setResult({
          success: true,
          message: "Check-out successful",
          data: checkoutResp.data,
        });
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Failed to obtain location");
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location-Based Attendance
        </CardTitle>
        <CardDescription>Check in using your device location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HTTPS Warning for Mobile */}
        {!window.location.protocol.includes("https") &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">
                    Location Access Limited
                  </p>
                  <p className="text-yellow-700 mt-1">
                    Mobile browsers require HTTPS for location access. You may
                    need to manually allow location permissions in your browser
                    settings.
                  </p>
                </div>
              </div>
            </div>
          )}

        {result && result.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">{result.message}</p>
                <p className="text-sm text-green-700 mt-1">
                  Checked in at{" "}
                  {new Date(result.data.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Check-in Failed</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleCheckIn}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Check In Now
              </>
            )}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Out
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationBasedAttendance;
