# StreamSpot Geocoding Features

This document describes the geocoding functionality implemented for the StreamSpot venue system.

## Overview

The geocoding system provides two main capabilities as specified in the requirements:
1. **Forward geocoding**: Automatically convert venue addresses to coordinates when saving
2. **Reverse geocoding**: Convert user location to address for finding nearby venues

## Features

### 🗺️ Forward Geocoding
- Automatically geocodes venue addresses when creating or updating venues
- Stores latitude/longitude coordinates in the database
- Uses free Nominatim (OpenStreetMap) API service

### 📍 Reverse Geocoding & Nearby Search
- Converts user coordinates to readable address
- Finds venues within specified radius (default 10km)
- Calculates accurate distances using Haversine formula

### 🏢 Enhanced Venue Management
- Auto-geocoding on venue creation/update
- Migration tool for existing venues
- Spatial indexing for fast location queries

## API Endpoints

### Geocoding APIs
```
POST /api/geocoding/forward
Body: { "address": "123 Main St, Chicago, IL" }
Response: { "latitude": 41.8781, "longitude": -87.6298, "address": "..." }

POST /api/geocoding/reverse  
Body: { "latitude": 41.8781, "longitude": -87.6298 }
Response: { "latitude": 41.8781, "longitude": -87.6298, "address": "..." }

POST /api/geocoding/nearby
Body: { "latitude": 41.8781, "longitude": -87.6298, "radius": 10 }
Response: [{ "id": "...", "name": "...", "distance": 2.5, ... }]
```

### Venue Management
```
POST /api/venues/create
Body: { "name": "Sports Bar", "address": "123 Main St", "description": "..." }
Response: { "success": true, "venue": { ...with coordinates... } }

POST /api/venues/migrate
Body: {}
Response: { "success": true, "processed": 5, "message": "..." }
```

## Database Schema

New columns added to `venues` table:
```sql
ALTER TABLE venues 
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

CREATE INDEX idx_venues_location ON venues (latitude, longitude);
```

## User Interface

### Enhanced Venues Page (`/venues`)
- Shows venue coordinates when available
- "Find venues near me" feature with geolocation
- Distance display for nearby venues

### Demo Page (`/demo`)
- Test forward/reverse geocoding
- Create venues with auto-geocoding
- Migrate existing venues
- Interactive testing interface

## Usage Examples

### Create Venue with Auto-Geocoding
```javascript
const response = await fetch('/api/venues/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Downtown Sports Bar',
    address: '123 Main St, Chicago, IL 60614',
    description: 'Great place to watch games'
  })
});
// Venue automatically gets latitude/longitude coordinates
```

### Find Nearby Venues
```javascript
// Get user location
const position = await navigator.geolocation.getCurrentPosition();

// Find nearby venues
const response = await fetch('/api/geocoding/nearby', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    radius: 5 // 5km radius
  })
});
const nearbyVenues = await response.json();
```

## Technical Details

### Geocoding Service
- **Provider**: Nominatim (OpenStreetMap)
- **Cost**: Free (no API key required)
- **Rate Limiting**: 1 request per second (implemented)
- **User Agent**: Required for API compliance

### Distance Calculation
- **Algorithm**: Haversine formula
- **Accuracy**: Very high for distances up to several hundred kilometers  
- **Performance**: Fast client-side calculation

### Error Handling
- Graceful fallback when geocoding fails
- Network error handling
- Invalid coordinate validation
- User permission handling for geolocation

## Files Changed

### New Files
- `lib/geocoding.ts` - Core geocoding utilities
- `lib/venues.ts` - Venue management with geocoding
- `components/NearbyVenues.tsx` - UI component for nearby search
- `app/api/geocoding/*` - API endpoints for geocoding
- `app/api/venues/create/route.ts` - Venue creation API
- `app/demo/page.tsx` - Testing interface

### Modified Files
- `app/venues/page.tsx` - Enhanced with nearby venues feature
- `supabase/migrations/*` - Database schema updates

### Database Migration
- New migration file: `20250630100000_add_geocoding_to_venues.sql`
- Adds latitude/longitude columns with spatial indexing

## Testing

The implementation includes:
- Unit tests for distance calculations
- API endpoint testing interface
- Interactive demo for manual testing
- Migration tools for existing data

Visit `/demo` in the application to test all geocoding features interactively.