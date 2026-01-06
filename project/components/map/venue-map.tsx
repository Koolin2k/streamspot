'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  lat: number;
  lng: number;
}

interface VenueMapProps {
  venues: Venue[];
  className?: string;
}

export function VenueMap({ venues, className }: VenueMapProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -77.0365,
    latitude: 38.8977,
    zoom: 11,
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className={`bg-[#0B0B0E] border border-white/10 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <p className="text-white/60 mb-2">Map unavailable</p>
          <p className="text-white/40 text-sm">Mapbox token not configured</p>
        </div>
      </div>
    );
  }

  // Calculate center if venues exist
  const center = venues.length > 0
    ? {
        longitude: venues.reduce((sum, v) => sum + v.lng, 0) / venues.length,
        latitude: venues.reduce((sum, v) => sum + v.lat, 0) / venues.length,
      }
    : { longitude: viewState.longitude, latitude: viewState.latitude };

  return (
    <div className={className}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        initialViewState={{
          ...center,
          zoom: 12,
        }}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />

        {/* Geolocate Control */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* Venue Markers */}
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            longitude={venue.lng}
            latitude={venue.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedVenue(venue);
            }}
          >
            <div className="cursor-pointer transform transition-transform hover:scale-110">
              <div className="bg-emerald-500 rounded-full p-2 shadow-lg border-2 border-white">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
          </Marker>
        ))}

        {/* Popup for selected venue */}
        {selectedVenue && (
          <Popup
            longitude={selectedVenue.lng}
            latitude={selectedVenue.lat}
            anchor="top"
            onClose={() => setSelectedVenue(null)}
            closeButton={true}
            closeOnClick={false}
            className="venue-popup"
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-sm mb-1">{selectedVenue.name}</h3>
              {selectedVenue.description && (
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {selectedVenue.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mb-2">
                {selectedVenue.address}, {selectedVenue.city}
              </p>
              <Link
                href={`/venue/${selectedVenue.id}`}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View Details →
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
