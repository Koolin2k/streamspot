export const dynamic = 'force-dynamic';
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
      title: 'NCAA Basketball',
      venue: 'Blitz Bar',
      time: 'Tonight 8:30 PM',
      image: 'https://cdn.pixabay.com/photo/2013/02/25/04/37/basketball-85919_1280.jpg',
      category: 'sports',
      rsvped: false
    },
    {
      id: '2',
      title: 'Love Island',
      venue: 'The Living Room',
      time: 'Sun 9:00 PM',
      image: 'data:image/webp;base64,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',
      category: 'shows',
      rsvped: false
    },
    {
      id: '3',
      title: 'World Cup Qualifier',
      venue: 'Dupont Circle',
      time: 'Sat 1:00 PM',
      image: 'https://th.bing.com/th/id/OIP.xT3nYcQpsQzRUYo0EwqQEgHaEK?w=299&h=180&c=7&r=0&o=7&dpr=2&pid=1.7&rm=3',
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
