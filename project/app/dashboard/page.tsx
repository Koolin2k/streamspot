'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, Settings, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

interface user_rsvp {
  id: string;
  event: {
    id: string;
    title: string;
    description: string;
    start_time: string;
    category: string;
    venue: {
      name: string;
      address: string;
    } | null;
  } | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rsvps, setRsvps] = useState<user_rsvp[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      fetchUserRsvps();
    }
  }, [user, loading, router]);

  const fetchUserRsvps = async () => {
    try {
      const { data, error } = await supabase
        .from('user_rsvp')
        .select(`
          id,
          created_at,
          event:events (
            id,
            title,
            description,
            start_time,
            category,
            venue:venues (
              name,
              address
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching RSVPs:', error);
      } else {
        const transformedData: user_rsvp[] = (data || []).map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          event: item.event ? {
            id: item.event.id,
            title: item.event.title,
            description: item.event.description,
            start_time: item.event.start_time,
            category: item.event.category,
            venue: Array.isArray(item.event.venue) && item.event.venue.length > 0
              ? item.event.venue[0]
              : item.event.venue
          } : null
        }));

        setRsvps(transformedData);
      }
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    } finally {
      setLoadingRsvps(false);
    }
  };

  const cancelRSVP = async (rsvpId: string) => {
    try {
      const { error } = await supabase
        .from('user_rsvp')
        .delete()
        .eq('id', rsvpId);

      if (error) {
        console.error('Error canceling RSVP:', error);
      } else {
        setRsvps(prev => prev.filter(rsvp => rsvp.id !== rsvpId));
      }
    } catch (error) {
      console.error('Error canceling RSVP:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sports':
        return 'bg-blue-500/20 text-blue-400';
      case 'shows':
        return 'bg-purple-500/20 text-purple-400';
      case 'movies':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading || loadingRsvps) {
    return (
      <div className="bg-[#0B0B0E] text-white font-inter antialiased min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="bg-[#0B0B0E] text-white font-inter antialiased selection:bg-emerald-400/20 min-h-screen pb-20 md:pb-8">
      {/* Content continues... */}
    </div>
  );
}
