import { supabase } from '@/lib/supabase';
import VenueDetailClient from './VenueDetailClient';
import { notFound } from 'next/navigation';

interface VenuePageProps {
  params: {
    id: string;
  };
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { id } = params;
  const { data: venue, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single();

  if (!venue || error) return notFound();

  return <VenueDetailClient venue={venue} />;
}
