'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Venue {
  id: string;
  name: string;
  address: string;
  description: string;
  image_url: string;
  events: {
    title: string;
    start_time: string;
  }[];
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchVenues = async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, address, description, image_url, events(title, start_time)')
        .order('name');

      if (error) {
        console.error('Error fetching venues:', error);
      } else {
        setVenues(data);
      }
    };

    fetchVenues();
  }, []);

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue) => (
        <Link key={venue.id} href={`/venue/${venue.id}`} className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
          <img src={venue.image_url} alt={venue.name} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h2 className="text-xl font-bold mb-1">{venue.name}</h2>
            <p className="text-sm text-gray-600 mb-2">{venue.address}</p>
            <p className="text-gray-700 text-sm mb-2 line-clamp-2">{venue.description}</p>
            {venue.events?.length > 0 && (
              <p className="text-sm text-green-700 font-medium">
                Next: {venue.events[0].title} @ {new Date(venue.events[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
