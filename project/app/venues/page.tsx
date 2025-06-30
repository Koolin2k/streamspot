export const dynamic = 'force-dynamic';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function VenuesPage() {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error loading venues: {error.message}
      </div>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <div className="text-center mt-10 text-white">
        No venues found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0E] p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Venues</h1>
      <ul className="space-y-4">
        {venues.map((venue) => (
          <li key={venue.id} className="border border-gray-600 rounded-lg p-4">
            <Link href={`/venue/${venue.id}`}>
              <div>
                <h2 className="text-xl font-semibold">{venue.name}</h2>
                <p className="text-sm text-gray-400">{venue.location}</p>
                <p className="mt-2 text-gray-300">{venue.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
