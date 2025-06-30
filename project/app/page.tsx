'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  PlayCircle,
  ArrowRight,
  Clock,
  Goal as Football,
  Film,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/hooks/use-auth';

export default function Page() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Optional: Any logic you want on mount
  }, []);

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
            Open Login
          </Button>
          <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
      ) : (
        <div>
          <p>Welcome back, {user.name || 'friend'}!</p>
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Example Event Cards */}
        <div className="border p-4 rounded shadow-sm hover:shadow-md transition">
          <h2 className="text-lg font-semibold">Sunday Night Football</h2>
          <div className="flex items-center text-muted-foreground text-sm gap-2 mt-2">
            <Clock className="w-4 h-4" />
            8:15 PM EST · NorthWest Stadium
          </div>
          <Link
            href="/events/snf-northwest"
            className="inline-flex items-center mt-3 text-primary hover:underline"
          >
            View Details <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Add more cards here */}
      </section>
    </main>
  );
}
