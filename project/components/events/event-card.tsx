import Link from 'next/link';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { formatDistance } from '@/lib/utils/geo';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    starts_at: string;
    venue_name: string;
    venue_address: string;
    venue_city: string;
    distance_meters?: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.starts_at);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const categoryColors = {
    sports: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    tv: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    culture: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const categoryColor = categoryColors[event.category as keyof typeof categoryColors] || categoryColors.other;

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="bg-[#0B0B0E] border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-white group-hover:text-emerald-400 transition-colors">
              {event.title}
            </CardTitle>
            <Badge className={`${categoryColor} border capitalize shrink-0`}>
              {event.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {event.description && (
            <p className="text-white/60 text-sm line-clamp-2">{event.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-white/70">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>

          <div className="flex items-start gap-2 text-sm text-white/70">
            <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-white">{event.venue_name}</div>
              <div className="text-xs">{event.venue_address}, {event.venue_city}</div>
            </div>
          </div>

          {event.distance_meters !== undefined && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
              <Clock className="w-4 h-4" />
              <span>{formatDistance(event.distance_meters)} away</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
