'use client';

import { useState } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/auth-modal';
import { EventCard } from '@/components/events/event-card';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from '@/hooks/use-location';
import { useNearbyEvents } from '@/hooks/use-nearby-events';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HomePage() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { coordinates, loading: locationLoading, error: locationError, permissionDenied, requestLocation } = useLocation();
  const { events, loading: eventsLoading, error: eventsError } = useNearbyEvents({
    coordinates,
    category: selectedCategory,
    enabled: !!coordinates,
  });

  const displayName = user?.email?.split('@')[0] || 'there';
  const categories = ['sports', 'tv', 'culture'];

  return (
    <main className="min-h-screen bg-[#0B0B0E] text-white pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold font-space-grotesk">
            Events Near You
          </h1>
          <p className="text-white/60">
            Discover live sports, watch parties, and cultural events happening nearby
          </p>
        </div>

        {/* Location Status */}
        {locationLoading && (
          <Alert className="bg-emerald-500/10 border-emerald-500/30">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            <AlertDescription className="text-white/70">
              Getting your location...
            </AlertDescription>
          </Alert>
        )}

        {locationError && (
          <Alert className="bg-orange-500/10 border-orange-500/30">
            <AlertCircle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-white/70">
              {locationError}
              {permissionDenied && (
                <Button
                  onClick={requestLocation}
                  variant="link"
                  className="text-emerald-400 p-0 h-auto ml-2"
                >
                  Try again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {coordinates && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>
              Showing events within 10 miles of your location
            </span>
          </div>
        )}

        {/* Auth CTA */}
        {!user && (
          <Alert className="bg-white/5 border-white/10">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-white/70">Sign in to save events and RSVP</span>
              <Button
                onClick={() => setModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                size="sm"
              >
                Sign In
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            onClick={() => setSelectedCategory(undefined)}
            variant={selectedCategory === undefined ? 'default' : 'outline'}
            className={
              selectedCategory === undefined
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'border-white/20 text-white/70 hover:text-white hover:border-white/40'
            }
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={
                selectedCategory === category
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white capitalize'
                  : 'border-white/20 text-white/70 hover:text-white hover:border-white/40 capitalize'
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Events Loading */}
        {eventsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        )}

        {/* Events Error */}
        {eventsError && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-white/70">
              {eventsError}
            </AlertDescription>
          </Alert>
        )}

        {/* Events Grid */}
        {!eventsLoading && !eventsError && events.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* No Events */}
        {!eventsLoading && !eventsError && events.length === 0 && coordinates && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">
              No events found nearby
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
            <p className="text-white/40 text-sm mt-2">
              Try selecting a different category or check back later
            </p>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}
