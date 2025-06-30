import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const { data: venues, error } = await supabase.from('venues').select('id');
  if (error || !venues) return [];

  return venues.map((venue) => ({ id: venue.id }));
}

export default async function VenuePage({ params }: { params: { id: string } }) {
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !venue) notFound();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{venue.name}</h1>
      <p>{venue.description}</p>
    </div>
  );
}
