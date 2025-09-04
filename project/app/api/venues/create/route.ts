import { NextRequest, NextResponse } from 'next/server';
import { createVenueWithGeocoding } from '@/lib/venues';

export async function POST(request: NextRequest) {
  try {
    const { name, address, description, image_url } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Valid venue name is required' },
        { status: 400 }
      );
    }

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Valid venue address is required' },
        { status: 400 }
      );
    }

    const result = await createVenueWithGeocoding({
      name,
      address,
      description,
      image_url,
    });

    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to create venue', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      venue: result.data,
      message: 'Venue created successfully with geocoding',
    }, { status: 201 });
  } catch (error) {
    console.error('Venue creation API error:', error);
    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}