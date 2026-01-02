# Frontend Implementation - Location Tracking Integration

## Overview

The frontend has been successfully integrated with the backend location tracking system. The frontend is now running on `http://localhost:8080` with real-time location tracking capabilities.

## What's Been Implemented

### 1. **API Client** (`/src/lib/api-client.ts`)

- Axios-based HTTP client with automatic JWT token handling
- Interceptors for authentication and error handling
- Support for all backend endpoints

### 2. **Location Tracking Hook** (`/src/hooks/useLocationTracker.ts`)

- React hook for managing geolocation
- Watches device location in real-time
- Sends location updates to backend every 30 seconds
- Validates check-ins with geofencing

### 3. **Location Tracker Component** (`/src/components/dashboard/LocationTracker.tsx`)

- Visual UI for location tracking
- Start/stop tracking controls
- Check-in validation
- Real-time coordinate display
- Accuracy indicator

### 4. **Location-Based Attendance** (`/src/components/dashboard/LocationBasedAttendance.tsx`)

- Quick check-in using device location
- Geofence validation
- Check-in success/failure feedback
- Automatic attendance marking

### 5. **Updated Dashboard** (`/src/pages/Index.tsx`)

- Integrated location tracker on main dashboard
- Real-time location updates
- Quick access to tracking controls

### 6. **Updated Attendance Page** (`/src/pages/Attendance.tsx`)

- Location-based check-in component at the top
- Quick check-in without opening another page
- Integrated with existing attendance table

## Configuration

### Environment Variables (.env)

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao
VITE_SUPABASE_URL=https://bfpyadzwoolsdcnrtgbq.supabase.co
VITE_SUPABASE_PROJECT_ID=bfpyadzwoolsdcnrtgbq
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How to Use

### 1. Start the Frontend

```bash
cd "D:\CTC\FRONT\Code-The-Cause--The-Errors\field-force-tracker-71-main"
npm run dev
```

Frontend runs on: `http://localhost:8080`

### 2. Start the Backend (in another terminal)

```bash
cd D:\CTC\SERVER
npm start
```

Backend runs on: `http://localhost:3000`

### 3. Access the Application

- Open browser to `http://localhost:8080`
- Navigate to Dashboard or Attendance page
- Click "Start Tracking" to begin location updates
- Use "Check In Now" or "Validate Check-in" buttons

## Features

### Real-Time Location Tracking

- Continuous geolocation updates
- Accuracy indicator (±meters)
- Stop tracking when needed
- Graceful error handling

### Check-In Validation

- Automatic geofence verification
- Distance calculation
- Real-time feedback on validity
- Prevents false check-ins outside work areas

### Automatic Backend Sync

- Location updates sent every 30 seconds
- JWT token automatically included
- Error retry logic
- Offline-friendly (queues updates)

### Security

- JWT authentication on all requests
- Automatic token refresh
- Redirect to login on 401 errors
- CORS-enabled communication

## Testing the Integration

### Test 1: Dashboard Location Tracker

1. Navigate to `http://localhost:8080/`
2. Find the Location Tracker component (right side)
3. Click "Start Tracking"
4. Verify location coordinates appear
5. Click "Validate Check-in" to verify geofence

### Test 2: Quick Check-in

1. Go to `http://localhost:8080/attendance`
2. Find Location-Based Attendance card at top
3. Click "Check In Now"
4. Verify success message appears
5. Check backend logs to confirm location received

### Test 3: Continuous Tracking

1. Start tracking on dashboard
2. Allow 30+ seconds
3. Check browser console for location updates
4. Verify coordinates change (if moving)

## Backend Integration Points

The frontend communicates with these backend endpoints:

```
POST   /api/location/update              - Update worker location
POST   /api/location/validate-checkin   - Validate geofence
POST   /api/location/distance            - Calculate distance
POST   /api/location/optimize-route      - Optimize route
GET    /api/location/worker/:id/history  - Get location history
POST   /api/attendance                    - Mark attendance
GET    /api/attendance                    - Get attendance records
```

## Troubleshooting

### Location Permission Denied

- Browser must have permission to access location
- Check browser settings: Privacy → Location
- Allow location access for localhost:8080
- Use HTTPS in production

### API Connection Failed

- Verify backend is running on port 3000
- Check `.env` has correct `VITE_API_BASE_URL`
- Ensure CORS is enabled on backend
- Check browser console for detailed errors

### TypeScript Errors

- Run `npm install` to ensure all types are installed
- Clear `.dist` folder: `rm -r dist`
- Restart dev server

## Dependencies Added

- `axios` - HTTP client for API calls
- All UI components from `@radix-ui` (already included)
- Location services built with native Geolocation API

## Next Steps

1. **Customize Worker/Project IDs**

   - Replace hardcoded IDs in components
   - Use authentication context to pass real IDs

2. **Add Map Visualization**

   - Install `react-leaflet` or `@react-google-maps/api`
   - Add map showing current location
   - Display other workers' locations

3. **Build Frontend**

   - Run `npm run build` for production
   - Outputs to `/dist` folder

4. **Deploy**
   - Use `npm run preview` for local build test
   - Deploy to Vercel, Netlify, or AWS S3

## File Structure

```
src/
├── components/
│   └── dashboard/
│       ├── LocationTracker.tsx
│       └── LocationBasedAttendance.tsx
├── hooks/
│   └── useLocationTracker.ts
├── lib/
│   └── api-client.ts
├── pages/
│   ├── Index.tsx (Updated)
│   └── Attendance.tsx (Updated)
└── ...
```

## Current Status

✅ Frontend dev server running on port 8080
✅ Backend API integration complete
✅ Location tracking implemented
✅ Check-in validation integrated
✅ Real-time updates working
✅ Error handling in place
