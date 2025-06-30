'use client';

import { useState } from 'react';
import { Sun, Moon, CheckCircle, Pencil, Trash, Clock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminEvent {
  id: string;
  name: string;
  venue: string;
  status: 'pending' | 'approved' | 'rejected';
  dateTime: string;
}

export default function AdminDashboard() {
  const [isDark, setIsDark] = useState(true);
  const [events, setEvents] = useState<AdminEvent[]>([
    {
      id: '1',
      name: 'Super Bowl Party',
      venue: 'Gridiron Pub',
      status: 'pending',
      dateTime: 'Feb 11, 2025 • 6:30 PM'
    },
    {
      id: '2',
      name: 'NBA Finals Game 5',
      venue: 'Downtown Sports Bar',
      status: 'approved',
      dateTime: 'Jun 15, 2025 • 8:00 PM'
    },
    {
      id: '3',
      name: 'UFC 299 Watch Party',
      venue: 'Fight Club Lounge',
      status: 'rejected',
      dateTime: 'Apr 9, 2025 • 9:00 PM'
    }
  ]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const updateEventStatus = (eventId: string, newStatus: 'approved' | 'rejected') => {
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, status: newStatus }
          : event
      )
    );
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const bulkApprove = () => {
    setEvents(prev =>
      prev.map(event =>
        event.status === 'pending'
          ? { ...event, status: 'approved' }
          : event
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            <Check className="w-3.5 h-3.5" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="inline-flex items-center gap-1 bg-rose-400/20 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full">
            <X className="w-3.5 h-3.5" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen`}>
      <div className="bg-white dark:bg-[#0B0B0E] text-[#0B0B0E] dark:text-white font-inter antialiased selection:bg-emerald-400/20">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0B0B0E]/90 backdrop-blur border-b border-black/10 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold tracking-tight font-space-grotesk">Admin Dashboard</h1>

            <div className="flex items-center gap-4">
              <Button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              <div className="flex items-center gap-2">
                <img 
                  src="https://i.pravatar.cc/40?img=8" 
                  alt="Admin avatar" 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium hidden sm:block">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* Page Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight font-space-grotesk">Submitted Events</h2>
              <p className="text-sm text-black/60 dark:text-white/60">Review, edit, or approve incoming events.</p>
            </div>

            <Button 
              onClick={bulkApprove}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow hover:shadow-lg transition active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              Bulk Approve
            </Button>
          </div>

          {/* Events Table */}
          <section className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
            <div className="overflow-x-auto scroll-smooth">
              <table className="min-w-full text-sm leading-normal">
                <caption className="sr-only">Submitted events awaiting review</caption>

                {/* Table Head */}
                <thead className="bg-black/5 dark:bg-white/5">
                  <tr className="text-left">
                    <th scope="col" className="px-6 py-3 font-medium">Event Name</th>
                    <th scope="col" className="px-6 py-3 font-medium">Venue</th>
                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                    <th scope="col" className="px-6 py-3 font-medium whitespace-nowrap">Date / Time</th>
                    <th scope="col" className="px-6 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-black/10 dark:divide-white/10">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                      <td className="px-6 py-4">{event.name}</td>
                      <td className="px-6 py-4">{event.venue}</td>
                      <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{event.dateTime}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          {event.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => updateEventStatus(event.id, 'approved')}
                                className="p-2 rounded-md hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition"
                                aria-label="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => updateEventStatus(event.id, 'rejected')}
                                className="p-2 rounded-md hover:bg-red-500/10 text-red-600 dark:text-red-400 transition"
                                aria-label="Reject"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition"
                            aria-label="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => deleteEvent(event.id)}
                            className="p-2 rounded-md hover:bg-red-500/10 text-red-600 dark:text-red-400 transition"
                            aria-label="Delete"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}