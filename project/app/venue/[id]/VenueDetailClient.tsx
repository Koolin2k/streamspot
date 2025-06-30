'use client';

import { useState, useEffect } from 'react';

interface VenueDetailClientProps {
  venue: {
    id: string;
    name: string;
    address: string;
    description: string;
    image_url: string;
    events?: {
      title: string;
      start_time: string;
    }[];
  };
}

export default function VenueDetailClient({ venue }: VenueDetailClientProps) {
  const [nextEvent, setNextEvent] = useState<string | null>(null);

  useEffect(() => {
    if (venue.events && venue.events.length > 0) {
      const next = venue.events[0];
      setNextEvent(`${next.title} @ ${new Date(next.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }
  }, [venue.events]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <img
        src={venue.image_url}
        alt={venue.name}
        className="w-full h-64 object-cover rounded-md shadow mb-6"
      />
      <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
      <p className="text-gray-600 mb-2">{venue.address}</p>
      <p className="text-gray-800 mb-4 whitespace-pre-line">{venue.description}</p>
      {nextEvent && (
        <p className="text-green-600 font-medium">Next event: {nextEvent}</p>
      )}
    </div>
  );
}
