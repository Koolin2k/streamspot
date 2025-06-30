import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const dynamicParams = true;

export async function generateStaticParams() {
  const { data } = await supabase.from('venues').select('id');
  return (data || []).map((venue) => ({ id: venue.id }));
}

export default async function VenuePage({ params }: { params: { id: string } }) {
  const { data: venue, error } = await supabase
    .from('venues')
    .select('id, name, address, description, image_url, events(title, start_time)')
    .eq('id', params.id)
    .single();

  if (!venue || error) return notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <img src={venue.image_url} alt={venue.name} className="w-full h-64 object-cover rounded mb-4" />
      <h1 className="text-3xl font-bold mb-2">{venue.name}</h1>
      <p className="text-gray-600 mb-2">{venue.address}</p>
      <p className="mb-4">{venue.description}</p>
      {venue.events?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
          <ul className="space-y-2">
            {venue.events.map((event: any, i: number) => (
              <li key={i} className="border p-2 rounded">
                <strong>{event.title}</strong> - {new Date(event.start_time).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
