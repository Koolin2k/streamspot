export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { VenuesClient } from '@/components/venues/venues-client';

export default async function VenuesPage() {
  const supabase = await createClient();

  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">Error loading venues</p>
          <p className="text-white/60 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg">No venues found</p>
          <p className="text-white/40 text-sm mt-2">Check back later for new venues</p>
        </div>
      </div>
    );
  }

  return <VenuesClient venues={venues} />;
}
