import { NextRequest, NextResponse } from 'next/server';
import { geocodeExistingVenues } from '@/lib/venues';

export async function POST(request: NextRequest) {
  try {
    const result = await geocodeExistingVenues();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Failed to migrate venues', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Venue migration API error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate venues' },
      { status: 500 }
    );
  }
}