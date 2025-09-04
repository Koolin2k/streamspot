'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentLocation, type Coordinates } from '@/lib/geocoding';

interface Venue {
  id: string;
  name: string;
  address: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

export default function NearbyVenues() {
  const [loading, setLoading] = useState(false);
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const findNearbyVenues = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user's current location
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Fetch nearby venues
      const response = await fetch('/api/geocoding/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 10, // 10km radius
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nearby venues');
      }

      const venues = await response.json();
      setNearbyVenues(venues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border border-gray-600 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Find Nearby Venues</h2>
      
      <Button 
        onClick={findNearbyVenues} 
        disabled={loading}
        className="mb-4"
      >
        {loading ? 'Finding venues...' : 'Find venues near me'}
      </Button>

      {error && (
        <div className="text-red-400 mb-4">
          Error: {error}
        </div>
      )}

      {userLocation && (
        <div className="text-sm text-gray-400 mb-4">
          Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
        </div>
      )}

      {nearbyVenues.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">
            Found {nearbyVenues.length} venue(s) nearby:
          </h3>
          <ul className="space-y-2">
            {nearbyVenues.map((venue) => (
              <li key={venue.id} className="p-3 border border-gray-700 rounded">
                <div className="font-medium">{venue.name}</div>
                <div className="text-sm text-gray-400">{venue.address}</div>
                {venue.distance && (
                  <div className="text-sm text-blue-400">
                    {venue.distance.toFixed(1)} km away
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {nearbyVenues.length === 0 && userLocation && !loading && !error && (
        <div className="text-gray-400">
          No venues found within 10km of your location.
        </div>
      )}
    </div>
  );
}