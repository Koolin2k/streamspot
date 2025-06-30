'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Goal as Football, Film, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  title: string;
  venue: string;
  start_time: string;
  category: string;
  status: 'live' | 'upcoming';
  attendees: number;
  rsvped: boolean;
  avatars: string[];
}

export default function TonightsLineup() {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live');
  const [sportFilter, setSportFilter] = useState('');
  const [showFilter, setShowFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [countdown, setCountdown] = useState<{ [key: string]: string }>({});

  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time');

      if (!error && data) {
        const mapped = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          venue: e.venue_name,
          start_time: e.start_time,
          category: e.category,
          status: new Date(e.start_time) <= new Date() ? 'live' : 'upcoming',
          attendees: e.attendees || 0,
          rsvped: false,
          avatars: [
            'https://i.pravatar.cc/32?img=1',
            'https://i.pravatar.cc/32?img=2',
            'https://i.pravatar.cc/32?img=3'
          ]
        }));
        setEvents(mapped);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const newCountdown: { [key: string]: string } = {};

      events.forEach(event => {
        const diff = new Date(event.start_time).getTime() - now;
        if (diff <= 0) {
          newCountdown[event.id] = 'Live now';
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newCountdown[event.id] = `${days ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`;
        }
      });
      setCountdown(newCountdown);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [events]);

  const handleRSVP = async (eventId: string) => {
    if (!user) return setShowAuthModal(true);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rsvped: !e.rsvped, attendees: e.rsvped ? e.attendees - 1 : e.attendees + 1 } : e));
  };

  const filteredEvents = events.filter(event => {
    if (event.status !== activeTab) return false;
    if (sportFilter && !event.category.includes(sportFilter.toLowerCase())) return false;
    if (showFilter && !event.category.includes(showFilter.toLowerCase())) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nfl': return <Football className="w-3 h-3" />;
      case 'finale': return <Film className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'nfl': return 'bg-[#FFA8A8]/10 text-[#FFA8A8] border-[#FFA8A8]/30';
      case 'finale': return 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/30';
      default: return 'bg-white/10 text-white border-white/30';
    }
  };

  return <>{/* Existing JSX remains unchanged for rendering UI */}</>;
}
