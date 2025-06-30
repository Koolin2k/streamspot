export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Venue {
  id: string;
  name: string;
  description?: string;
  location?: string;
  created_at?: string;
}

export default function VenueDetailClient() {
  const { id } = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching venue:', error);
      } else {
        setVenue(data);
      }

      setLoading(false);
    };

    if (id) {
      fetchVenue();
    }
  }, [id]);

  if (loading) {
    return <p className="text-white">Loading venue...</p>;
  }

  if (!venue) {
    return <p className="text-white">Venue not found.</p>;
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-2">{venue.name}</h1>
      {venue.description && <p className="mb-2">{venue.description}</p>}
      {venue.location && <p className="mb-2">Location: {venue.location}</p>}
      {venue.created_at && <p className="text-sm">Created at: {new Date(venue.created_at).toLocaleString()}</p>}
    </div>
  );
}
