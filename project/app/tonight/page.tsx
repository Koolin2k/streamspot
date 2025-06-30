'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Goal as Football, Film, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/hooks/use-auth';

interface Event {
  id: string;
  title: string;
  venue: string;
  startTime: string;
  status: 'live' | 'upcoming';
  type: 'nfl' | 'finale' | 'basketball';
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
  
  const { user } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'NFL · Wild Card',
      venue: 'Gridiron Pub',
      startTime: '2030-12-31T23:59:59Z',
      status: 'upcoming',
      type: 'nfl',
      attendees: 23,
      rsvped: false,
      avatars: [
        'https://i.pravatar.cc/32?img=1',
        'https://i.pravatar.cc/32?img=2',
        'https://i.pravatar.cc/32?img=3'
      ]
    },
    {
      id: '2',
      title: 'Series Finale Watch Party',
      venue: 'Cinema House',
      startTime: '2000-01-01T00:00:00Z',
      status: 'live',
      type: 'finale',
      attendees: 56,
      rsvped: false,
      avatars: [
        'https://i.pravatar.cc/32?img=8',
        'https://i.pravatar.cc/32?img=11',
        'https://i.pravatar.cc/32?img=12'
      ]
    }
  ]);

  const [countdown, setCountdown] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const newCountdown: { [key: string]: string } = {};
      
      events.forEach(event => {
        const diff = new Date(event.startTime).getTime() - now;
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

  const handleRSVP = (eventId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? {
              ...event,
              rsvped: !event.rsvped,
              attendees: event.rsvped ? event.attendees - 1 : event.attendees + 1
            }
          : event
      )
    );
  };

  const filteredEvents = events.filter(event => {
    if (event.status !== activeTab) return false;
    if (sportFilter && !event.type.includes(sportFilter.toLowerCase())) return false;
    if (showFilter && !event.type.includes(showFilter.toLowerCase())) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nfl':
        return <Football className="w-3 h-3" />;
      case 'finale':
        return <Film className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'nfl':
        return 'bg-[#FFA8A8]/10 text-[#FFA8A8] border-[#FFA8A8]/30';
      case 'finale':
        return 'bg-[#A78BFA]/10 text-[#A78BFA] border-[#A78BFA]/30';
      default:
        return 'bg-white/10 text-white border-white/30';
    }
  };

  return (
    <div className="bg-[#0B0B0E] text-white font-inter antialiased selection:bg-emerald-400/20 min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B0B0E]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-emerald-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-space-grotesk">WatchTogether</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-16 z-30 backdrop-blur bg-[#0B0B0E]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex rounded-full bg-white/5 p-1">
            <Button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-1.5 flex items-center gap-2 rounded-full text-sm font-medium transition ${
                activeTab === 'live'
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'live' ? 'bg-[#00C37A]' : 'bg-white/40'}`}></span>
              Live
            </Button>
            <Button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-1.5 flex items-center gap-2 rounded-full text-sm font-medium transition ${
                activeTab === 'upcoming'
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'upcoming' ? 'bg-[#00C37A]' : 'bg-white/40'}`}></span>
              Upcoming
            </Button>
          </div>

          <div className="flex flex-1 flex-wrap gap-2 justify-end md:justify-start">
            <select 
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="bg-white/5 backdrop-blur px-3 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00C37A] border-0"
            >
              <option value="">All Sports</option>
              <option value="basketball">Basketball</option>
              <option value="nfl">NFL</option>
              <option value="soccer">Soccer</option>
            </select>
            <select 
              value={showFilter}
              onChange={(e) => setShowFilter(e.target.value)}
              className="bg-white/5 backdrop-blur px-3 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00C37A] border-0"
            >
              <option value="">All Shows</option>
              <option value="finale">Finale</option>
              <option value="series">Series</option>
              <option value="premiere">Premiere</option>
            </select>
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-white/5 backdrop-blur px-3 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#00C37A] border-0"
            >
              <option value="">Everywhere</option>
              <option value="dc">DC</option>
              <option value="arlington">Arlington</option>
              <option value="baltimore">Baltimore</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-space-grotesk text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
          Tonight's Lineup
        </h1>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <article 
                key={event.id}
                className="relative flex flex-col bg-white/5 rounded-3xl p-5 border border-white/10 shadow-sm hover:border-emerald-500/50 transition-all duration-300"
              >
                {/* Type Badge */}
                <Badge className={`absolute -top-2 -left-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${getTypeBadgeColor(event.type)}`}>
                  {getTypeIcon(event.type)}
                  {event.type.toUpperCase()}
                </Badge>

                <header className="flex items-start justify-between mb-4">
                  <h2 className="text-lg font-medium leading-snug tracking-tight pr-4">{event.title}</h2>
                  <span 
                    className={`w-2.5 h-2.5 mt-1 rounded-full ${
                      event.status === 'live' ? 'bg-[#00C37A]' : 'bg-white/40'
                    }`}
                    aria-label={event.status}
                  ></span>
                </header>

                <p className="text-sm text-white/70">{event.venue}</p>
                <p className="text-sm text-white/50 mt-1">
                  {event.status === 'live' ? 'Started 2h ago' : `Starts at ${new Date(event.startTime).toLocaleTimeString()}`}
                </p>

                {/* Countdown */}
                <Badge className={`mt-4 inline-block text-xs font-medium px-3 py-1.5 rounded-full ${
                  event.status === 'live' 
                    ? 'bg-[#00C37A]/20 text-[#00C37A]'
                    : 'bg-[#FFC24C]/10 text-[#FFC24C] animate-pulse'
                }`}>
                  {countdown[event.id] || 'Loading...'}
                </Badge>

                {/* Attendees */}
                <div className="flex items-center justify-between mt-5">
                  <div className="flex -space-x-3">
                    {event.avatars.map((avatar, index) => (
                      <img 
                        key={index}
                        src={avatar} 
                        alt={`Attendee ${index + 1}`}
                        className="w-8 h-8 rounded-full ring-2 ring-[#0B0B0E]" 
                        loading="lazy"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-white/60">
                    <Users className="w-4 h-4" />
                    {event.attendees}
                  </div>
                </div>

                {/* RSVP Button */}
                <Button
                  onClick={() => handleRSVP(event.id)}
                  className={`mt-6 inline-flex items-center gap-2 font-medium px-4 py-2 rounded-full backdrop-blur transition-all ${
                    event.rsvped
                      ? 'bg-white/10 text-white cursor-default'
                      : 'bg-[#00C37A]/20 hover:bg-[#00C37A]/30 text-[#00C37A] hover:shadow-[0_0_8px_1px_#00C37A]'
                  }`}
                >
                  {event.rsvped ? (
                    <>
                      <Check className="w-4 h-4" />
                      You RSVP'd
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      RSVP
                    </>
                  )}
                </Button>
              </article>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center text-center py-20 gap-6">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center">
              <Clock className="w-16 h-16 text-white/20" />
            </div>
            <h2 className="font-space-grotesk text-2xl font-semibold tracking-tight">Nothing lined up... yet</h2>
            <p className="max-w-xs text-white/60">We couldn't find any watch parties for tonight. Want to change that?</p>
            <Button className="bg-[#00C37A]/20 hover:bg-[#00C37A]/30 text-[#00C37A] px-4 py-2 rounded-full text-sm font-medium">
              Notify Me
            </Button>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}