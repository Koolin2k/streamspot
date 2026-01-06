'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Map as MapIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VenueMap } from '@/components/map/venue-map';

interface Venue {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  lat: number;
  lng: number;
  image_url?: string | null;
}

interface VenuesClientProps {
  venues: Venue[];
}

export function VenuesClient({ venues }: VenuesClientProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-white pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">Venues</h1>
            <p className="text-white/60 mt-1">
              {venues.length} {venues.length === 1 ? 'venue' : 'venues'} in DC
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            <Button
              onClick={() => setViewMode('list')}
              variant="ghost"
              size="sm"
              className={
                viewMode === 'list'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              onClick={() => setViewMode('map')}
              variant="ghost"
              size="sm"
              className={
                viewMode === 'map'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Map
            </Button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          /* List View */
          venues.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {venues.map((venue) => (
                <Link
                  key={venue.id}
                  href={`/venue/${venue.id}`}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-emerald-500/50 transition-all group"
                >
                  <h2 className="text-xl font-semibold group-hover:text-emerald-400 transition-colors">
                    {venue.name}
                  </h2>
                  {venue.description && (
                    <p className="text-white/60 text-sm mt-2 line-clamp-2">
                      {venue.description}
                    </p>
                  )}
                  <p className="text-white/40 text-sm mt-2">
                    {venue.address}, {venue.city}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">No venues found</p>
            </div>
          )
        ) : (
          /* Map View */
          <VenueMap venues={venues} className="w-full h-[600px] rounded-lg overflow-hidden" />
        )}
      </div>
    </div>
  );
}
