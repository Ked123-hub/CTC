import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Radio, Maximize2, Minimize2, X } from 'lucide-react';
import { mockAttendance } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom pulsing marker icon for real-time tracking
const createPulsingIcon = () => {
  return L.divIcon({
    className: 'custom-pulsing-marker',
    html: `
      <div style="position: relative;">
        <div style="position: absolute; width: 24px; height: 24px; background: hsl(142, 76%, 36%); border-radius: 50%; animation: pulse 2s infinite;"></div>
        <div style="position: absolute; width: 16px; height: 16px; background: hsl(142, 76%, 46%); border-radius: 50%; top: 4px; left: 4px; border: 2px solid white;"></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface VolunteerLocation {
  lat: number;
  lng: number;
  address: string;
  name: string;
  lastUpdated: string;
}

interface AttendanceMapProps {
  selectedStaffId: string | null;
  onStaffSelect?: (id: string | null) => void;
}

export function AttendanceMap({ selectedStaffId, onStaffSelect }: AttendanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const fullscreenMapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [liveVolunteer, setLiveVolunteer] = useState<VolunteerLocation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const selectedMarkerIdRef = useRef<string | null>(null);
  const presentStaff = mockAttendance.filter(a => a.checkIn);

  // Poll for live volunteer location from localStorage
  useEffect(() => {
    const checkLiveLocation = () => {
      const stored = localStorage.getItem('volunteerLocation');
      if (stored) {
        try {
          const location = JSON.parse(stored);
          setLiveVolunteer(location);
        } catch (e) {
          console.error('Failed to parse volunteer location');
        }
      }
    };

    checkLiveLocation();
    const interval = setInterval(checkLiveLocation, 2000);

    return () => clearInterval(interval);
  }, []);

  // Initialize or reinitialize map
  const initializeMap = (container: HTMLDivElement) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersRef.current.clear();
    }

    const map = L.map(container).setView([19.0760, 72.8777], 11);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add static markers for mock data
    presentStaff.forEach((record) => {
      const marker = L.marker([record.location.lat, record.location.lng])
        .addTo(map)
        .bindPopup(`
          <div class="text-sm">
            <strong>${record.staffName}</strong><br/>
            <span class="text-muted-foreground">${record.location.address}</span><br/>
            <span class="text-xs">Check-in: ${record.checkIn}</span>
          </div>
        `);
      marker.on('click', () => {
        if (onStaffSelect) onStaffSelect(record.id);
      });
      markersRef.current.set(record.id, marker);
    });

    // Add live volunteer marker if exists
    if (liveVolunteer) {
      const marker = L.marker([liveVolunteer.lat, liveVolunteer.lng], {
        icon: createPulsingIcon(),
      })
        .addTo(map)
        .bindPopup(`
          <div class="text-sm">
            <strong>${liveVolunteer.name}</strong> <span style="color: hsl(142, 76%, 36%);">● LIVE</span><br/>
            <span class="text-muted-foreground">${liveVolunteer.address}</span><br/>
            <span class="text-xs">Last update: ${new Date(liveVolunteer.lastUpdated).toLocaleTimeString()}</span>
          </div>
        `);
      markersRef.current.set('live-volunteer', marker);
    }

    // Fit bounds to show all markers
    const allPoints = [
      ...presentStaff.map(record => [record.location.lat, record.location.lng] as [number, number]),
      ...(liveVolunteer ? [[liveVolunteer.lat, liveVolunteer.lng] as [number, number]] : [])
    ];

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return map;
  };

  // Initialize map on mount and when fullscreen changes
  useEffect(() => {
    const container = isFullscreen ? fullscreenMapRef.current : mapRef.current;
    if (!container) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap(container);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current.clear();
        selectedMarkerIdRef.current = null;
      }
    };
  }, [isFullscreen]);

  // Update live volunteer marker in real-time
  useEffect(() => {
    if (!mapInstanceRef.current || !liveVolunteer) return;

    const map = mapInstanceRef.current;
    const markerId = 'live-volunteer';

    if (markersRef.current.has(markerId)) {
      const existingMarker = markersRef.current.get(markerId)!;
      existingMarker.setLatLng([liveVolunteer.lat, liveVolunteer.lng]);
      existingMarker.setPopupContent(`
        <div class="text-sm">
          <strong>${liveVolunteer.name}</strong> <span style="color: hsl(142, 76%, 36%);">● LIVE</span><br/>
          <span class="text-muted-foreground">${liveVolunteer.address}</span><br/>
          <span class="text-xs">Last update: ${new Date(liveVolunteer.lastUpdated).toLocaleTimeString()}</span>
        </div>
      `);
    } else {
      const marker = L.marker([liveVolunteer.lat, liveVolunteer.lng], {
        icon: createPulsingIcon(),
      })
        .addTo(map)
        .bindPopup(`
          <div class="text-sm">
            <strong>${liveVolunteer.name}</strong> <span style="color: hsl(142, 76%, 36%);">● LIVE</span><br/>
            <span class="text-muted-foreground">${liveVolunteer.address}</span><br/>
            <span class="text-xs">Last update: ${new Date(liveVolunteer.lastUpdated).toLocaleTimeString()}</span>
          </div>
        `);
      markersRef.current.set(markerId, marker);
    }
  }, [liveVolunteer]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Reset previous selected marker icon if any
    if (selectedMarkerIdRef.current && markersRef.current.has(selectedMarkerIdRef.current)) {
      const prevMarker = markersRef.current.get(selectedMarkerIdRef.current)!;
      prevMarker.setIcon(new L.Icon.Default());
    }

    if (selectedStaffId && markersRef.current.has(selectedStaffId)) {
      const marker = markersRef.current.get(selectedStaffId)!;
      const latLng = marker.getLatLng();
      marker.setIcon(createPulsingIcon());
      marker.openPopup();
      map.setView(latLng, Math.max(map.getZoom(), 15), { animate: true });
      selectedMarkerIdRef.current = selectedStaffId;
    } else {
      // If selection cleared, fit bounds to show all points again
      const allPoints: [number, number][] = presentStaff.map(r => [r.location.lat, r.location.lng]);
      if (liveVolunteer) {
        allPoints.push([liveVolunteer.lat, liveVolunteer.lng]);
      }
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        map.fitBounds(bounds, { padding: [30, 30] });
      }
      selectedMarkerIdRef.current = null;
    }
  }, [selectedStaffId, liveVolunteer, presentStaff]);

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Staff Locations</h3>
          <div className="flex items-center gap-2">
            {liveVolunteer && (
              <Badge variant="outline" className="gap-1 border-success text-success text-xs">
                <Radio className="h-3 w-3 animate-pulse" />
                <span className="hidden sm:inline">Live</span>
              </Badge>
            )}
            <Badge variant="success" className="gap-1 text-xs">
              <Users className="h-3 w-3" />
              <span className="hidden sm:inline">{presentStaff.length + (liveVolunteer ? 1 : 0)} Active</span>
              <span className="sm:hidden">{presentStaff.length + (liveVolunteer ? 1 : 0)}</span>
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Leaflet Map */}
        <div 
          ref={mapRef} 
          className="h-40 sm:h-48 rounded-lg border border-border overflow-hidden z-0"
          style={{ minHeight: '160px' }}
        />

        {/* Location List */}
        <div className="mt-4 space-y-2">
          {liveVolunteer && (
            <div className="flex items-center gap-2 text-sm bg-success/10 p-2 rounded-lg">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse flex-shrink-0" />
              <span className="font-medium text-foreground truncate">{liveVolunteer.name}</span>
              <Badge variant="outline" className="text-[10px] px-1 py-0 border-success text-success flex-shrink-0">LIVE</Badge>
              <span className="text-muted-foreground text-xs truncate hidden sm:inline">{liveVolunteer.address.substring(0, 40)}...</span>
            </div>
          )}
          {presentStaff.slice(0, liveVolunteer ? 2 : 3).map((record) => (
            <div key={record.id} className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-success flex-shrink-0" />
              <span className="font-medium text-foreground truncate">{record.staffName}</span>
              <span className="text-muted-foreground hidden sm:inline">•</span>
              <span className="text-muted-foreground text-xs truncate hidden sm:inline">{record.location.address}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Fullscreen Map Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-background via-background/90 to-transparent">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Staff Locations</h2>
                <div className="flex items-center gap-2">
                  {liveVolunteer && (
                    <Badge variant="outline" className="gap-1 border-success text-success">
                      <Radio className="h-3 w-3 animate-pulse" />
                      Live Tracking
                    </Badge>
                  )}
                  <Badge variant="success" className="gap-1">
                    <Users className="h-3 w-3" />
                    {presentStaff.length + (liveVolunteer ? 1 : 0)} Active
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(false)}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Fullscreen Map */}
            <div 
              ref={fullscreenMapRef}
              className="w-full h-full"
            />

            {/* Location List Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
              <div className="max-w-2xl mx-auto space-y-2">
                {liveVolunteer && (
                  <div className="flex items-center gap-2 text-sm bg-success/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="h-3 w-3 rounded-full bg-success animate-pulse flex-shrink-0" />
                    <span className="font-medium text-foreground">{liveVolunteer.name}</span>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-success text-success">LIVE</Badge>
                    <span className="text-muted-foreground text-sm truncate flex-1">{liveVolunteer.address}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presentStaff.slice(0, 4).map((record) => (
                    <div key={record.id} className="flex items-center gap-2 text-sm bg-card/80 backdrop-blur-sm p-2 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-success flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">{record.staffName}</span>
                      <span className="text-muted-foreground text-xs truncate flex-1">{record.location.address}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
