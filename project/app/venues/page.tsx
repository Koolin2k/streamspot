'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Users, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Venue {
  id: string;
  name: string;
  address: string;
  description: string;
  image: string;
  rating: number;
  upcomingEvents: number;
  distance: string;
  category: string;
}

export default function VenuesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [venues, setVenues] = useState<Venue[]>([
    {
      id: '1',
      name: 'The Gridiron Pub',
      address: '213 Victory Ave, Austin, TX 78704',
      description: 'Sports bar & grill with big screens and craft beers',
      image: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=800&q=80',
      rating: 4.5,
      upcomingEvents: 3,
      distance: '0.8 mi',
      category: 'sports'
    },
    {
      id: '2',
      name: 'Cinema House',
      address: '456 Film St, Austin, TX 78701',
      description: 'Cozy venue perfect for TV show premieres and finales',
      image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
      rating: 4.2,
      upcomingEvents: 5,
      distance: '1.2 mi',
      category: 'shows'
    },
    {
      id: '3',
      name: 'Downtown Sports Bar',
      address: '789 Main St, Austin, TX 78702',
      description: 'Premier destination for live sports viewing',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      upcomingEvents: 2,
      distance: '2.1 mi',
      category: 'sports'
    },
    {
      id: '4',
      name: 'The Living Room',
      address: '321 Cozy Ave, Austin, TX 78703',
      description: 'Intimate setting for binge-watching parties',
      image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=800&q=80',
      rating: 4.3,
      upcomingEvents: 4,
      distance: '1.5 mi',
      category: 'shows'
    }
  ]);

  const categories = [
    { id: 'all', label: 'All Venues' },
    { id: 'sports', label: 'Sports' },
    { id: 'shows', label: 'TV Shows' },
    { id: 'movies', label: 'Movies' }
  ];

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || venue.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#0B0B0E] text-white font-inter antialiased selection:bg-emerald-400/20 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0B0B0E]/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button className="p-2 rounded-lg hover:bg-white/10 transition">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold tracking-tight font-space-grotesk">All Venues</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold font-space-grotesk hidden sm:block">WatchTogether</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full bg-white/5 backdrop-blur placeholder:text-white/40 text-white border-0 focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === category.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Venues Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
        {filteredVenues.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <Link key={venue.id} href={`/venue/${venue.id}`}>
                <article className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 shadow-sm hover:border-emerald-500/50 transition-all duration-300 cursor-pointer">
                  {/* Venue Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {venue.distance}
                      </Badge>
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full">
                        ⭐ {venue.rating}
                      </Badge>
                    </div>
                  </div>

                  {/* Venue Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight font-space-grotesk line-clamp-1">
                        {venue.name}
                      </h3>
                      <p className="text-sm text-white/70 line-clamp-2 mt-1">
                        {venue.description}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-white/60 line-clamp-2">
                        {venue.address}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/60">
                          {venue.upcomingEvents} upcoming events
                        </span>
                      </div>
                      <Button className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                        View →
                      </Button>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center text-center py-20 gap-6">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center">
              <MapPin className="w-16 h-16 text-white/20" />
            </div>
            <h2 className="font-space-grotesk text-2xl font-semibold tracking-tight">No venues found</h2>
            <p className="max-w-xs text-white/60">
              Try adjusting your search or filter criteria to find venues.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}