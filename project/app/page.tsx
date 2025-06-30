'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, PlayCircle, ArrowRight, Clock, Goal as Football, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/hooks/use-auth';

interface TrendingEvent {
  id: string;
  title: string;
  venue: string;
  time: string;
  image: string;
  category: 'sports' | 'shows' | 'movies';
  rsvped: boolean;
}

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [trendingEvents, setTrendingEvents] = useState<TrendingEvent[]>([
    {
      id: '1',
      title: 'NBA Finals · Game 3',
      venue: 'Blitz Bar',
      time: 'Tonight 8:30 PM',
      image: 'https://images.unsplash.com/photo-1606410433668-1fe24f4b3e28?auto=format&fit=crop&w=800&q=80',
      category: 'sports',
      rsvped: false
    },
    {
      id: '2',
      title: 'Succession Finale Watch',
      venue: 'The Living Room',
      time: 'Sun 9:00 PM',
      image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80',
      category: 'shows',
      rsvped: false
    },
    {
      id: '3',
      title: 'World Cup Qualifier',
      venue: 'Dupont Circle',
      time: 'Sat 1:00 PM',
      image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80',
      category: 'sports',
      rsvped: false
    }
  ]);

  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleRSVP = (eventId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setTrendingEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, rsvped: !event.rsvped }
          : event
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sports':
        return <Football className="w-4 h-4" />;
      case 'shows':
        return <Film className="w-4 h-4" />;
      default:
        return <PlayCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-[#0B0B0E] text-white font-inter antialiased selection:bg-emerald-400/20 min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(0,195,122,0.35)_0,transparent_60%)]"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 md:pt-40 flex flex-col md:flex-row items-center gap-10">
          {/* Copy */}
          <div className={`w-full md:w-1/2 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-500/20">
                <PlayCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm uppercase tracking-widest text-emerald-300/80 font-space-grotesk">WatchTogether</span>
            </div>
            <h1 className="font-space-grotesk text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight">
              Find your next <span className="text-emerald-400">watch party</span>.
            </h1>
            <p className="mt-6 text-lg text-white/75 max-w-md">
              Explore live sports, binge-worthy shows, and cultural events happening tonight across the DMV.
            </p>

            {/* Search Bar */}
            <div className="mt-8 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                type="text"
                placeholder="Search by team, show, or venue…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:max-w-lg pl-12 pr-4 py-3 rounded-full bg-white/5 backdrop-blur placeholder:text-white/40 text-white border-0 focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div className={`w-full md:w-1/2 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <img 
              src="https://images.unsplash.com/photo-1525286116112-b59af11adad1?auto=format&fit=crop&w=1400&q=80"
              alt="Friends watching sports at a bar"
              className="rounded-2xl shadow-2xl object-cover h-80 sm:h-96 md:h-[30rem] w-full"
            />
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="border-t border-white/10 my-14"></div>
      </div>

      {/* Trending Events */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className={`font-space-grotesk text-2xl md:text-3xl font-semibold tracking-tight mb-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Trending near you
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingEvents.map((event, index) => (
            <article 
              key={event.id}
              className={`relative rounded-3xl overflow-hidden group transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: `${400 + index * 100}ms` }}
            >
              <img 
                src={event.image}
                alt={event.title}
                className="object-cover w-full h-64 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 p-4">
                <h3 className="font-medium text-lg">{event.title}</h3>
                <p className="text-sm text-white/80">{event.venue} • {event.time}</p>
                <Button
                  onClick={() => handleRSVP(event.id)}
                  className={`mt-3 inline-flex items-center gap-2 font-medium px-3 py-1.5 rounded-full backdrop-blur transition-all ${
                    event.rsvped
                      ? 'bg-emerald-500/30 text-emerald-300 hover:bg-emerald-500/40'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {getCategoryIcon(event.category)}
                  {event.rsvped ? 'RSVP\'d' : 'RSVP'}
                </Button>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className={`text-center mt-12 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <Link href="/tonight">
            <Button className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-full font-medium text-white">
              View Tonight's Lineup <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-sm text-white/60">&copy; 2024 WatchTogether. All rights reserved.</p>
          <div className="flex gap-6 text-white/40">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Contact</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}