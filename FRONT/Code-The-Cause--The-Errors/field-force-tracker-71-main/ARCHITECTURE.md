# Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │          Frontend Application (React + Vite)              │  │
│  │  Port: 8080 | TypeScript | TailwindCSS                   │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │          Page Components                             │ │  │
│  │  │  • Dashboard (Location Tracker)                      │ │  │
│  │  │  • Attendance (Quick Check-in)                       │ │  │
│  │  │  • Tasks, Leave, Reports, etc.                       │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                           ↕                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │         React Hooks & State Management              │ │  │
│  │  │  • useLocationTracker - Real-time tracking          │ │  │
│  │  │  • useQuery - Server state management               │ │  │
│  │  │  • useState - Local UI state                         │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                           ↕                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │      API Client (Axios)                             │ │  │
│  │  │  • JWT Token Management                             │ │  │
│  │  │  • Automatic Auth Headers                           │ │  │
│  │  │  • Error Interceptors                               │ │  │
│  │  │  • CORS Configuration                               │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                           ↕                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │      Browser Geolocation API                        │ │  │
│  │  │  • GPS / Network Position                           │ │  │
│  │  │  • Accuracy Measurement                             │ │  │
│  │  │  • Real-time Watchposition                          │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  HTTP(S) REQUESTS ↔ RESPONSES                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↕
                    localhost:8080
                            ↕
        ───────────────────────────────────────────
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER                                │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │          Express.js Application                            │  │
│  │  Port: 3000 | Node.js | JavaScript                         │  │
│  │                                                             │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │         Router Layer                                 │ │  │
│  │  │  • /api/location/* - Location tracking routes        │ │  │
│  │  │  • /api/attendance/* - Attendance routes             │ │  │
│  │  │  • /api/auth/* - Authentication routes               │ │  │
│  │  │  • /api/tasks/* - Task management                    │ │  │
│  │  │  • /api/projects/* - Project management              │ │  │
│  │  │  • /api/analytics/* - Analytics                      │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                           ↕                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │         Controller Layer                             │ │  │
│  │  │  • Location Tracking Controller                      │ │  │
│  │  │  • Attendance Controller                             │ │  │
│  │  │  • Authentication Controller                         │ │  │
│  │  │  • Project, Task, Leave Controllers                  │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                           ↕                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │         Service Layer                                │ │  │
│  │  │  • location-tracking.service.js                      │ │  │
│  │  │  • geofence.service.js                               │ │  │
│  │  │  • route-optimization.service.js                     │ │  │
│  │  │  • google-maps.service.js                            │ │  │
│  │  │  • attendance.service.js                             │ │  │
│  │  │  • project.service.js                                │ │  │
│  │  │  • ... other services                                │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                           ↕                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │         External Services                            │ │  │
│  │  │  • Google Maps API (Maps, Geocoding, Directions)    │ │  │
│  │  │  • Redis Cache (Optional, Graceful Fallback)        │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │                           ↕                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │         Database Layer                               │ │  │
│  │  │  • PostgreSQL                                        │ │  │
│  │  │  • Drizzle ORM                                       │ │  │
│  │  │  Tables:                                             │ │  │
│  │  │  • attendance, workers, projects, tasks             │ │  │
│  │  │  • shifts, leaves, events, notifications            │ │  │
│  │  │  • location_history, geofences                       │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  MIDDLEWARE & UTILITIES:                                         │
│  • JWT Authentication                                            │
│  • CORS Handler                                                 │
│  • Error Handler                                                │
│  • Request Logger                                               │
│  • Rate Limiter                                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                    localhost:3000
```

## Data Flow: Check-in Process

```
User clicks "Check In Now"
            ↓
Browser requests location
            ↓
User allows location permission
            ↓
GPS/Network provides coordinates
            ↓
LocationBasedAttendance component receives data
            ↓
API Client validates with /location/validate-checkin
            ↓
Backend: Geofence Service checks distance
            ↓
Backend: Validates latitude/longitude within radius
            ↓
Backend: Creates attendance record if valid
            ↓
Frontend: Shows success message ✅
            ↓
User attendance marked in database
```

## Real-time Location Tracking Flow

```
"Start Tracking" button clicked
            ↓
useLocationTracker hook activated
            ↓
Browser.geolocation.watchPosition() started
            ↓
Every 30 seconds:
  ├─ Get current coordinates
  ├─ Calculate accuracy
  ├─ Send to /api/location/update
  ├─ Backend stores location history
  └─ Update component state
            ↓
Display coordinates on screen
            ↓
"Stop Tracking" button clicked
            ↓
watchPosition() cleared
            ↓
Updates stop
```

## Component Hierarchy

```
App.tsx (Main Router)
│
├─ Layout
│  └─ MainLayout (Navigation, Sidebar)
│
├─ Dashboard Page (Index.tsx)
│  ├─ StatsCards
│  ├─ AttendanceMap
│  ├─ TaskOverview
│  ├─ LocationTracker ← Location Component
│  └─ RecentActivity
│
├─ Attendance Page
│  ├─ LocationBasedAttendance ← Location Component
│  ├─ Filters & Search
│  ├─ Summary Cards
│  └─ Attendance Table
│
├─ Tasks Page
├─ Leave Page
├─ Projects Page
└─ Admin Routes...
```

## Location Tracking Component Architecture

```
LocationTracker Component
│
├─ State:
│  ├─ isTracking (boolean)
│  ├─ currentLocation (lat, lng, accuracy)
│  ├─ error (string | null)
│  └─ watchId (number | null)
│
├─ Hook: useLocationTracker
│  ├─ startTracking() - Enable watchPosition
│  ├─ stopTracking() - Disable watchPosition
│  ├─ validateCheckIn() - Call backend validation
│  └─ calculateDistance() - Call backend distance
│
└─ UI Elements:
   ├─ Display coordinates
   ├─ Show accuracy
   ├─ Start/Stop buttons
   ├─ Validate button
   └─ Status indicator
```

## API Integration Points

```
Frontend                      ↔  Backend
────────────────────────────────────────
useLocationTracker            ↔  location-tracking.service.js
LocationBasedAttendance       ↔  attendance.controller.js
api-client.ts                 ↔  Routes Layer
Axios HTTP                    ↔  Express Middleware
JWT Headers                   ↔  Auth Middleware
CORS Enabled                  ↔  CORS Handler
Error Interceptors            ↔  Error Handler
```

## Security Flow

```
Login → Get JWT Token
         ↓
Store in localStorage
         ↓
Every API request:
  ├─ Read token from localStorage
  ├─ Add to Authorization header
  └─ Send with request
         ↓
Backend verifies token
         ↓
If valid → Process request ✅
If invalid → Return 401 → Redirect to login
```

## Geofence Validation Logic

```
Check-in Location Received
         ↓
Calculate distance using Haversine formula:
  Distance = 2R × arcsin(√(sin²(Δφ/2) + cos φ₁ × cos φ₂ × sin²(Δλ/2)))
  where:
    R = Earth's radius (6,371 km)
    Δφ = difference in latitude
    Δλ = difference in longitude
         ↓
Compare with geofence radius (default: 100m)
         ↓
If distance ≤ radius:
  └─ Mark as VALID ✅
If distance > radius:
  └─ Mark as WARNING ⚠️
```

## Database Schema (Relevant to Location)

```
attendance table
├─ id (UUID)
├─ workerId (UUID)
├─ projectId (UUID)
├─ latitude (DECIMAL)
├─ longitude (DECIMAL)
├─ accuracy (FLOAT)
├─ type (check-in | check-out)
├─ timestamp (TIMESTAMP)
└─ status (valid | invalid)

workers table
├─ id (UUID)
├─ name (STRING)
├─ email (STRING)
└─ projectAssignments[]

projects table
├─ id (UUID)
├─ name (STRING)
├─ location (POINT)
├─ geofenceRadius (FLOAT)
└─ members[]

geofences table
├─ id (UUID)
├─ projectId (UUID)
├─ latitude (DECIMAL)
├─ longitude (DECIMAL)
├─ radius (FLOAT)
└─ name (STRING)
```

## Performance Metrics

```
Frontend:
├─ Initial load: <2s
├─ Location update: <1s
├─ API call: <500ms
└─ Component render: <100ms

Backend:
├─ Geofence validation: <10ms
├─ Database write: <50ms
├─ Google Maps API: <500-1000ms
└─ Average response: <600ms

Location:
├─ GPS acquisition: 5-30s (first time)
├─ Update frequency: 30s (configurable)
├─ Accuracy: ±5-50m (device dependent)
└─ Battery impact: ~5% per hour
```

---

**This architecture enables**:

- Real-time location tracking
- Geofence-based attendance
- Automatic check-in validation
- Historical location analysis
- Team member location awareness
- Route optimization suggestions
- Advanced analytics & reporting
