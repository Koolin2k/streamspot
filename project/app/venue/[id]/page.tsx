'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Sparkles, CalendarClock, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/hooks/use-auth';

interface VenueEvent {
  id: string;
  title: string;
  startTime: string;
  image: string;
  attendees: number;
  rsvped: boolean;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  description: string;
  hours: string;
  features: string;
  rating: number;
  images: string[];
  events: VenueEvent[];
}

// Generate static params for all possible venue IDs
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
    { id: '6' },
    { id: '7' },
    { id: '8' },
    { id: '9' },
    { id: '10' }
  ];
}

export default function VenueDetail() {
  const params = useParams();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  // Mock venue data
  const venue: Venue = {
    id: params.id as string,
    name: 'The Gridiron Pub',
    address: '213 Victory Ave, Austin, TX 78704',
    description: 'Sports bar & grill • $$ • 4.5⭐️',
    hours: '4 PM – 2 AM (Mon-Sun)',
    features: 'Lively, big screens, craft beers, patio seating',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80'
    ],
    events: [
      {
        id: '1',
        title: 'Wildcard Showdown',
        startTime: '9:00 PM',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
        attendees: 23,
        rsvped: false
      },
      {
        id: '2',
        title: 'Love Island Premiere',
        startTime: '8:00 PM',
        image: 'https://images.unsplash.com/photo-1601924928380-bd6353403dbb?auto=format&fit=crop&w=800&q=80',
        attendees: 48,
        rsvped: false
      }
    ]
  };

  const [events, setEvents] = useState<VenueEvent[]>(venue.events);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % venue.images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPlay, venue.images.length]);

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

  const handleReserveTable = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    // Handle table reservation logic here
    alert('Table reservation functionality would be implemented here');
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000); // Resume auto-play after 10s
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % venue.images.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + venue.images.length) % venue.images.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  return (
    <div className="bg-[#0B0B0E] text-white font-inter antialiased selection:bg-emerald-400/20 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0B0B0E]/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          <h1 className="text-lg font-semibold tracking-tight font-space-grotesk">WatchTogether</h1>
          <Button 
            onClick={() => router.push('/')}
            className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Discover</span>
          </Button>
        </div>
      </header>

      {/* Venue Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        <div className="md:grid md:grid-cols-5 md:gap-8">
          {/* Carousel */}
          <div className="md:col-span-3">
            <div className="relative overflow-hidden rounded-3xl aspect-video md:aspect-[4/3]">
              <div 
                className="flex transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {venue.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`Venue image ${index + 1}`}
                    className="w-full flex-shrink-0 object-cover h-full"
                  />
                ))}
              </div>

              {/* Navigation Controls */}
              <Button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full p-2"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full p-2"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              {/* Dot Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                {venue.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-1.5 w-4 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/20'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Venue Info */}
          <aside className="md:col-span-2 mt-6 md:mt-0 space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight font-space-grotesk">{venue.name}</h2>
              <p className="text-white/70 mt-1 text-sm">{venue.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 flex-none text-[#00C37A]" />
                <p className="text-sm leading-5">{venue.address}</p>
              </div>
              <div className="flex gap-3 items-start">
                <Clock className="w-5 h-5 flex-none text-[#00C37A]" />
                <p className="text-sm leading-5">
                  <span className="font-medium">Hours:</span> {venue.hours}
                </p>
              </div>
              <div className="flex gap-3 items-start">
                <Sparkles className="w-5 h-5 flex-none text-[#00C37A]" />
                <p className="text-sm leading-5">{venue.features}</p>
              </div>
            </div>

            <Button 
              onClick={handleReserveTable}
              className="hidden md:inline-flex items-center justify-center gap-2 bg-[#00C37A] text-[#0B0B0E] font-medium px-6 py-3 rounded-full shadow hover:shadow-lg transition animate-pulse"
            >
              <CalendarClock className="w-5 h-5" />
              Reserve Table
            </Button>
          </aside>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-12 md:mt-16">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight font-space-grotesk">Upcoming Events</h3>
          <a href="#" className="text-sm text-[#00C37A] hover:underline">View all</a>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <article 
              key={event.id}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00C37A]/10 via-white/5 to-white/5 border border-white/10 shadow-sm hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="relative">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="aspect-video w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-black bg-[#FFC24C]/90">
                    <Clock className="w-3 h-3" />
                    {index === 0 ? 'Tonight' : 'New'}
                  </Badge>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h4 className="text-base font-semibold tracking-tight font-space-grotesk line-clamp-2">{event.title}</h4>
                <p className="text-sm text-white/70">Starts {event.startTime}</p>
                <div className="flex items-center justify-between pt-1">
                  <Button
                    onClick={() => handleRSVP(event.id)}
                    className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full backdrop-blur transition-all ${
                      event.rsvped
                        ? 'bg-white/10 text-white cursor-default'
                        : 'bg-[#00C37A]/20 hover:shadow-[0_0_8px_1px_#00C37A] text-[#00C37A]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {event.rsvped ? 'RSVP\'d' : 'RSVP'}
                  </Button>
                  <span className="text-sm text-white/60">{event.attendees} going</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <Button 
        onClick={handleReserveTable}
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#00C37A] text-[#0B0B0E] font-medium px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition animate-pulse"
      >
        <CalendarClock className="w-5 h-5 mr-2" />
        Reserve Table
      </Button>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}