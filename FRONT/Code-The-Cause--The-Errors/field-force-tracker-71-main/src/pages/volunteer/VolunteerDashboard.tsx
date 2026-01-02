import { useState, useEffect } from 'react';
import { VolunteerLayout } from '@/components/layout/VolunteerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Clock, MapPin, CheckCircle, LogIn, LogOut, Loader2, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';

interface AttendanceState {
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkInLocation: { lat: number; lng: number; address: string } | null;
  checkOutTime: string | null;
  checkOutLocation: { lat: number; lng: number; address: string } | null;
}

export default function VolunteerDashboard() {
  const [attendance, setAttendance] = useState<AttendanceState>({
    isCheckedIn: false,
    checkInTime: null,
    checkInLocation: null,
    checkOutTime: null,
    checkOutLocation: null,
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  // Enable continuous tracking only when checked in
  const { latitude, longitude, address, loading: geoLoading, lastUpdated } = useGeolocation(
    attendance.isCheckedIn,
    10000 // Update every 10 seconds
  );

  // Update current location in state when tracking
  useEffect(() => {
    if (attendance.isCheckedIn && latitude && longitude && address) {
      // Store in localStorage for cross-component access (simulating shared state)
      localStorage.setItem('volunteerLocation', JSON.stringify({
        lat: latitude,
        lng: longitude,
        address,
        lastUpdated: lastUpdated?.toISOString(),
        name: 'Current Volunteer'
      }));
    }
  }, [attendance.isCheckedIn, latitude, longitude, address, lastUpdated]);

  const getCurrentLocation = (): Promise<{ lat: number; lng: number; address: string }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
              address = data.display_name;
            }
          } catch (err) {
            console.error('Failed to get address:', err);
          }

          resolve({ lat: latitude, lng: longitude, address });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setGettingLocation(true);
    
    try {
      const location = await getCurrentLocation();
      setGettingLocation(false);
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      setAttendance({
        isCheckedIn: true,
        checkInTime: timeString,
        checkInLocation: location,
        checkOutTime: null,
        checkOutLocation: null,
      });

      toast.success('Checked in successfully!', {
        description: `Location: ${location.address.substring(0, 50)}...`,
      });
    } catch (error) {
      setGettingLocation(false);
      toast.error('Failed to get your location', {
        description: 'Please enable location services and try again.',
      });
    }
    
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setGettingLocation(true);
    
    try {
      const location = await getCurrentLocation();
      setGettingLocation(false);
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });

      setAttendance(prev => ({
        ...prev,
        isCheckedIn: false,
        checkOutTime: timeString,
        checkOutLocation: location,
      }));

      toast.success('Checked out successfully!', {
        description: `Location: ${location.address.substring(0, 50)}...`,
      });
    } catch (error) {
      setGettingLocation(false);
      toast.error('Failed to get your location', {
        description: 'Please enable location services and try again.',
      });
    }
    
    setLoading(false);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <VolunteerLayout title="Attendance" subtitle="Check in and out for your shifts">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Date Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground text-sm">Today</p>
              <p className="text-lg font-semibold text-foreground mt-1">{today}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={cn(
            'border-2 transition-colors',
            attendance.isCheckedIn 
              ? 'border-success/50 bg-success/5' 
              : attendance.checkOutTime 
                ? 'border-muted bg-muted/20'
                : 'border-warning/50 bg-warning/5'
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={cn(
                  'w-4 h-4 rounded-full animate-pulse',
                  attendance.isCheckedIn ? 'bg-success' : attendance.checkOutTime ? 'bg-muted-foreground' : 'bg-warning'
                )} />
                <Badge variant={attendance.isCheckedIn ? 'success' : attendance.checkOutTime ? 'secondary' : 'warning'} className="text-sm px-4 py-1">
                  {attendance.isCheckedIn ? 'Currently Working' : attendance.checkOutTime ? 'Shift Completed' : 'Not Checked In'}
                </Badge>
              </div>

              {/* Check In/Out Button */}
              <div className="flex justify-center mb-6">
                {!attendance.isCheckedIn ? (
                  <Button
                    size="lg"
                    onClick={handleCheckIn}
                    disabled={loading || !!attendance.checkOutTime}
                    className="gap-2 px-8 py-6 text-lg gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {gettingLocation ? 'Getting location...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        Check In
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="gap-2 px-8 py-6 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {gettingLocation ? 'Getting location...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <LogOut className="h-5 w-5" />
                        Check Out
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Time Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  'p-4 rounded-lg text-center',
                  attendance.checkInTime ? 'bg-success/10' : 'bg-muted/50'
                )}>
                  <Clock className={cn(
                    'h-5 w-5 mx-auto mb-2',
                    attendance.checkInTime ? 'text-success' : 'text-muted-foreground'
                  )} />
                  <p className="text-xs text-muted-foreground mb-1">Check In</p>
                  <p className="font-semibold text-foreground">
                    {attendance.checkInTime || '--:--'}
                  </p>
                </div>
                <div className={cn(
                  'p-4 rounded-lg text-center',
                  attendance.checkOutTime ? 'bg-info/10' : 'bg-muted/50'
                )}>
                  <Clock className={cn(
                    'h-5 w-5 mx-auto mb-2',
                    attendance.checkOutTime ? 'text-info' : 'text-muted-foreground'
                  )} />
                  <p className="text-xs text-muted-foreground mb-1">Check Out</p>
                  <p className="font-semibold text-foreground">
                    {attendance.checkOutTime || '--:--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real-time Tracking Indicator */}
        {attendance.isCheckedIn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 flex items-center gap-2 bg-success/90 text-success-foreground px-4 py-2 rounded-full shadow-lg"
          >
            <Radio className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Location tracking active</span>
          </motion.div>
        )}

        {/* Location Info */}
        {(attendance.checkInLocation || attendance.checkOutLocation) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {attendance.checkInLocation && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                    <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Check In Location</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {attendance.checkInLocation.address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {attendance.checkInLocation.lat.toFixed(6)}, {attendance.checkInLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}
                {attendance.checkOutLocation && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-info/5 border border-info/20">
                    <CheckCircle className="h-5 w-5 text-info shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Check Out Location</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {attendance.checkOutLocation.address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {attendance.checkOutLocation.lat.toFixed(6)}, {attendance.checkOutLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </VolunteerLayout>
  );
}
