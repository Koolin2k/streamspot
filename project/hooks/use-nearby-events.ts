import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Coordinates, DEFAULT_RADIUS_METERS } from '@/lib/utils/geo';

interface NearbyEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  starts_at: string;
  ends_at: string | null;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_lat: number;
  venue_lng: number;
  distance_meters: number;
}

interface UseNearbyEventsOptions {
  coordinates: Coordinates | null;
  radiusMeters?: number;
  category?: string;
  limit?: number;
  enabled?: boolean;
}

interface UseNearbyEventsReturn {
  events: NearbyEvent[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch nearby events using PostGIS function
 */
export function useNearbyEvents({
  coordinates,
  radiusMeters = DEFAULT_RADIUS_METERS,
  category,
  limit = 50,
  enabled = true,
}: UseNearbyEventsOptions): UseNearbyEventsReturn {
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!enabled || !coordinates) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase.rpc('get_nearby_events', {
        user_lat: coordinates.latitude,
        user_lng: coordinates.longitude,
        radius_meters: radiusMeters,
        event_category: category || null,
        result_limit: limit,
      });

      if (fetchError) {
        throw fetchError;
      }

      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching nearby events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [coordinates?.latitude, coordinates?.longitude, radiusMeters, category, limit, enabled]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}
