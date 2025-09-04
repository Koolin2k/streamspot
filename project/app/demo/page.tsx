'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function GeocodingDemo() {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [forwardResult, setForwardResult] = useState<any>(null);
  const [reverseResult, setReverseResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Venue creation state
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueDescription, setVenueDescription] = useState('');
  const [createResult, setCreateResult] = useState<any>(null);

  const handleForwardGeocode = async () => {
    if (!address.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/geocoding/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to geocode address');
      }
      
      const result = await response.json();
      setForwardResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReverseGeocode = async () => {
    if (!latitude || !longitude) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/geocoding/reverse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          latitude: parseFloat(latitude), 
          longitude: parseFloat(longitude) 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reverse geocode coordinates');
      }
      
      const result = await response.json();
      setReverseResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testMigrateVenues = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/venues/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await response.json();
      alert(`Migration result: ${result.message || 'Completed'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVenue = async () => {
    if (!venueName.trim() || !venueAddress.trim()) return;
    
    setLoading(true);
    setError(null);
    setCreateResult(null);
    
    try {
      const response = await fetch('/api/venues/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: venueName,
          address: venueAddress,
          description: venueDescription,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create venue');
      }
      
      const result = await response.json();
      setCreateResult(result);
      // Clear form
      setVenueName('');
      setVenueAddress('');
      setVenueDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0E] p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Geocoding Demo</h1>
      
      {error && (
        <div className="bg-red-600/20 border border-red-600 rounded p-4 mb-6">
          Error: {error}
        </div>
      )}

      {/* Forward Geocoding */}
      <div className="mb-8 p-4 border border-gray-600 rounded">
        <h2 className="text-xl font-semibold mb-4">Forward Geocoding (Address → Coordinates)</h2>
        <div className="mb-4">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter an address (e.g., 123 Main St, Chicago, IL)"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
        </div>
        <Button onClick={handleForwardGeocode} disabled={loading || !address.trim()}>
          {loading ? 'Geocoding...' : 'Get Coordinates'}
        </Button>
        
        {forwardResult && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
            <h3 className="font-semibold">Result:</h3>
            <p>Latitude: {forwardResult.latitude}</p>
            <p>Longitude: {forwardResult.longitude}</p>
            <p>Address: {forwardResult.address}</p>
          </div>
        )}
      </div>

      {/* Reverse Geocoding */}
      <div className="mb-8 p-4 border border-gray-600 rounded">
        <h2 className="text-xl font-semibold mb-4">Reverse Geocoding (Coordinates → Address)</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Latitude (e.g., 41.8781)"
            className="p-2 rounded bg-gray-800 text-white border border-gray-600"
            step="any"
          />
          <input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude (e.g., -87.6298)"
            className="p-2 rounded bg-gray-800 text-white border border-gray-600"
            step="any"
          />
        </div>
        <Button onClick={handleReverseGeocode} disabled={loading || !latitude || !longitude}>
          {loading ? 'Reverse Geocoding...' : 'Get Address'}
        </Button>
        
        {reverseResult && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded">
            <h3 className="font-semibold">Result:</h3>
            <p>Address: {reverseResult.address}</p>
          </div>
        )}
      </div>

      {/* Venue Creation with Auto-Geocoding */}
      <div className="mb-8 p-4 border border-gray-600 rounded">
        <h2 className="text-xl font-semibold mb-4">Create Venue with Auto-Geocoding</h2>
        <div className="space-y-4 mb-4">
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="Venue name (e.g., Sports Bar Chicago)"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
          <input
            type="text"
            value={venueAddress}
            onChange={(e) => setVenueAddress(e.target.value)}
            placeholder="Venue address (will be auto-geocoded)"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
          <textarea
            value={venueDescription}
            onChange={(e) => setVenueDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            rows={3}
          />
        </div>
        <Button 
          onClick={handleCreateVenue} 
          disabled={loading || !venueName.trim() || !venueAddress.trim()}
        >
          {loading ? 'Creating...' : 'Create Venue'}
        </Button>
        
        {createResult && (
          <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
            <h3 className="font-semibold">Venue Created Successfully!</h3>
            <p>Name: {createResult.venue?.name}</p>
            <p>Address: {createResult.venue?.address}</p>
            {createResult.venue?.latitude && createResult.venue?.longitude && (
              <p>Coordinates: {createResult.venue.latitude}, {createResult.venue.longitude}</p>
            )}
            <p className="text-sm text-green-400 mt-2">{createResult.message}</p>
          </div>
        )}
      </div>

      {/* Venue Migration */}
      <div className="mb-8 p-4 border border-gray-600 rounded">
        <h2 className="text-xl font-semibold mb-4">Venue Migration Tool</h2>
        <p className="text-gray-400 mb-4">
          This will geocode existing venues that don&apos;t have latitude/longitude coordinates.
        </p>
        <Button onClick={testMigrateVenues} disabled={loading}>
          {loading ? 'Migrating...' : 'Migrate Existing Venues'}
        </Button>
      </div>

      {/* Quick Test Addresses */}
      <div className="p-4 border border-gray-600 rounded">
        <h2 className="text-xl font-semibold mb-4">Quick Test</h2>
        <p className="text-gray-400 mb-4">Click to test with sample addresses:</p>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setAddress('123 Main St, Chicago, IL 60614')}
            size="sm"
          >
            Chicago Address
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setAddress('Times Square, New York, NY')}
            size="sm"
          >
            Times Square
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setLatitude('41.8781');
              setLongitude('-87.6298');
            }}
            size="sm"
          >
            Chicago Coords
          </Button>
        </div>
      </div>
    </div>
  );
}