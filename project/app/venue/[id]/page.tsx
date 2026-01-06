export const dynamic = "force-dynamic";

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function VenuePage({ params }: Props) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) return notFound();

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-white p-4">
      <h1 className="text-2xl font-bold mb-2">{data.name}</h1>
      <p className="text-md">{data.description}</p>
    </div>
  );
}
