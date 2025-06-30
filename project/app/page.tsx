'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/hooks/use-auth';

interface EventItem {
  id: string;
  title: string;
  time: string;
  location: string;
  slug: string;
}

export default function Page() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);

  const displayName = typeof user === 'object' && 'email' in user ? user.email?.split('@')[0] : 'friend';

  useEffect(() => {
    // Replace this with real fetch from Supabase or other backend
    setEvents([
      {
        id: '1',
        title: 'Sunday Night Football',
        time: '8:15 PM EST',
        location: 'NorthWest Stadium',
        slug: 'snf-northwest',
      },
      {
        id: '2',
        title: 'UFC Fight Night',
        time: '10:00 PM EST',
        location: 'Main Street Bar',
        slug: 'ufc-main-street',
      },
    ]);
  }, []);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Welcome to StreamSpot</h1>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search events, bars, games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {!user ? (
        <div className="bg-muted p-4 rounded">
          <p className="mb-2">Log in to save events and RSVP.</p>
          <Button onClick={() => setModalOpen(true)} variant="outline">
            Log In
          </Button>
          <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
      ) : (
        <div>
          <p className="text-muted-foreground">Welcome back, {displayName}!</p>
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map(event => (
          <div key={event.id} className="border p-4 rounded shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <div className="flex items-center text-muted-foreground text-sm gap-2 mt-2">
              <Clock className="w-4 h-4" />
              {event.time} · {event.location}
            </div>
            <Link
              href={`/events/${event.slug}`}
              className="inline-flex items-center mt-3 text-primary hover:underline"
            >
              View Details <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}
