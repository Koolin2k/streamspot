import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDistance } from '@/lib/geocoding';

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, radius = 10 } = await request.json();

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Valid latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get all venues with coordinates
    const { data: venues, error } = await supabase
      .from('venues')
      .select('*')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      throw error;
    }

    if (!venues) {
      return NextResponse.json([]);
    }

    // Calculate distances and filter by radius
    const venuesWithDistance = venues
      .map(venue => ({
        ...venue,
        distance: calculateDistance(
          latitude,
          longitude,
          venue.latitude,
          venue.longitude
        )
      }))
      .filter(venue => venue.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json(venuesWithDistance);
  } catch (error) {
    console.error('Nearby venues API error:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby venues' },
      { status: 500 }
    );
  }
}