import { supabase } from '@/lib/supabase';

export async function generateStaticParams() {
  const { data: venues, error } = await supabase.from('venues').select('id');

  if (error || !venues) {
    console.error('Error fetching venues:', error);
    return [];
  }

  return venues.map((venue) => ({ id: venue.id }));
}

export default async function VenuePage({ params }: { params: { id: string } }) {
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !venue) {
    return <div className="text-white p-8">Venue not found.</div>;
  }

  return (
    <div className="text-white p-8">
      <h1 className="text-3xl font-bold mb-4">{venue.name}</h1>
      <p className="mb-2">{venue.address}</p>
      <p className="mb-4">{venue.description}</p>
      <img src={venue.image_url} alt={venue.name} className="w-full max-w-md rounded" />
    </div>
  );
}
