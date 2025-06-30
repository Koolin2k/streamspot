'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, Settings, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

interface UserRSVP {
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
  const [rsvps, setRsvps] = useState<UserRSVP[]>([]);
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
        .from('rsvps')
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
        // Transform the data to match our interface
        const transformedData: UserRSVP[] = (data || []).map((item: any) => ({
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
        .from('rsvps')
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
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B0B0E]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-space-grotesk">Dashboard</h1>
                <p className="text-sm text-white/60">Welcome back, {displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button className="p-2 hover:bg-white/10 rounded-lg">
                <Bell className="w-5 h-5" />
              </Button>
              <Button className="p-2 hover:bg-white/10 rounded-lg">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl p-6 mb-8 border border-white/10">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-emerald-400" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold font-space-grotesk">{displayName}</h2>
              <p className="text-white/70">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-sm text-white/60">
                  <Users className="w-4 h-4" />
                  {rsvps.length} RSVPs
                </div>
                <div className="flex items-center gap-1 text-sm text-white/60">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RSVPs Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold font-space-grotesk">Your RSVPs</h3>
            <Button 
              onClick={() => router.push('/tonight')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium"
            >
              Find Events
            </Button>
          </div>

          {rsvps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white/40" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No RSVPs yet</h4>
              <p className="text-white/60 mb-6">Start exploring events and join your first watch party!</p>
              <Button 
                onClick={() => router.push('/tonight')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-medium"
              >
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rsvps.map((rsvp) => {
                // Skip rendering if event is null
                if (!rsvp.event) return null;
                
                return (
                  <article 
                    key={rsvp.id}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-emerald-500/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(rsvp.event.category)}`}>
                        {rsvp.event.category}
                      </Badge>
                      <Button
                        onClick={() => cancelRSVP(rsvp.id)}
                        className="p-1 hover:bg-red-500/10 text-red-400 rounded"
                        aria-label="Cancel RSVP"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <h4 className="font-semibold text-lg mb-2 line-clamp-2">{rsvp.event.title}</h4>
                    
                    <div className="space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{formatDate(rsvp.event.start_time)}</span>
                      </div>
                      {rsvp.event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">{rsvp.event.venue.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-white/50">
                        RSVP'd on {new Date(rsvp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}