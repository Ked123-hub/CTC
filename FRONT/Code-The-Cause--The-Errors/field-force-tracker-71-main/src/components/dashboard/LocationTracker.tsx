import { useEffect, useState } from "react";
import { useLocationTracker } from "@/hooks/useLocationTracker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, AlertCircle, Loader2, CheckCircle } from "lucide-react";

interface LocationTrackerComponentProps {
  workerId: string;
  projectId: string;
  onLocationUpdate?: (location: any) => void;
}

export const LocationTrackerComponent = ({
  workerId,
  projectId,
  onLocationUpdate,
}: LocationTrackerComponentProps) => {
  const {
    isTracking,
    currentLocation,
    error,
    startTracking,
    stopTracking,
    validateCheckIn,
  } = useLocationTracker();

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    if (currentLocation) {
      onLocationUpdate?.(currentLocation);
    }
  }, [currentLocation, onLocationUpdate]);

  const handleStartTracking = async () => {
    await startTracking(projectId, workerId, 30000);
  };

  const handleValidateCheckIn = async () => {
    if (!currentLocation) {
      alert("Unable to get current location");
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateCheckIn({
        projectId,
        workerId,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: currentLocation.accuracy,
      });
      setValidationResult(result);
    } catch (error) {
      console.error("Validation failed:", error);
      alert("Check-in validation failed");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Tracking
          </CardTitle>
          <CardDescription>
            Track your location during work hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Location Display */}
          {currentLocation && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">Current Location</p>
              <p className="font-mono text-sm mt-2">
                Latitude: {currentLocation.latitude.toFixed(6)}
                <br />
                Longitude: {currentLocation.longitude.toFixed(6)}
                <br />
                Accuracy: ±{Math.round(currentLocation.accuracy)}m
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Location Error
                </p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div
              className={`p-4 rounded-lg border ${
                validationResult.isValid
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                {validationResult.isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-900">Check-in Valid</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-900">Check-in Warning</span>
                  </>
                )}
              </p>
              <p className="text-sm text-gray-700">
                {validationResult.message}
              </p>
              {validationResult.distance && (
                <p className="text-sm text-gray-600 mt-2">
                  Distance from geofence: {validationResult.distance.toFixed(2)}
                  m
                </p>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isTracking ? (
              <Button
                onClick={handleStartTracking}
                className="flex-1"
                size="lg"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Start Tracking
              </Button>
            ) : (
              <Button
                onClick={stopTracking}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                Stop Tracking
              </Button>
            )}

            <Button
              onClick={handleValidateCheckIn}
              disabled={!currentLocation || isValidating}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                "Validate Check-in"
              )}
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Tracking Status</p>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isTracking ? "bg-green-500 animate-pulse" : "bg-gray-300"
                }`}
              />
              <span className="text-sm text-gray-600">
                {isTracking ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationTrackerComponent;
