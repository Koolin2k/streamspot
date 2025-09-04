/**
 * Venue utilities with geocoding integration
 */

import { supabase } from '@/lib/supabase';
import { forwardGeocode } from '@/lib/geocoding';

export interface Venue {
  id: string;
  name: string;
  address: string;
  description?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

/**
 * Create a new venue with automatic geocoding
 */
export async function createVenueWithGeocoding(venueData: {
  name: string;
  address: string;
  description?: string;
  image_url?: string;
}) {
  try {
    // Geocode the address
    const geocodeResult = await forwardGeocode(venueData.address);
    
    // Prepare venue data with optional coordinates
    const newVenue = {
      ...venueData,
      latitude: geocodeResult?.latitude || null,
      longitude: geocodeResult?.longitude || null,
    };

    // Insert into database
    const { data, error } = await supabase
      .from('venues')
      .insert([newVenue])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating venue with geocoding:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing venue with automatic geocoding if address changed
 */
export async function updateVenueWithGeocoding(
  venueId: string,
  venueData: {
    name?: string;
    address?: string;
    description?: string;
    image_url?: string;
  }
) {
  try {
    let updateData = { ...venueData };

    // If address is being updated, geocode it
    if (venueData.address) {
      const geocodeResult = await forwardGeocode(venueData.address);
      updateData = {
        ...updateData,
        latitude: geocodeResult?.latitude || null,
        longitude: geocodeResult?.longitude || null,
      };
    }

    // Update in database
    const { data, error } = await supabase
      .from('venues')
      .update(updateData)
      .eq('id', venueId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating venue with geocoding:', error);
    return { data: null, error };
  }
}

/**
 * Migrate existing venues to add geocoding coordinates
 * This function can be called to populate lat/lng for existing venues
 */
export async function geocodeExistingVenues() {
  try {
    // Get venues without coordinates
    const { data: venues, error: fetchError } = await supabase
      .from('venues')
      .select('id, address')
      .or('latitude.is.null,longitude.is.null');

    if (fetchError) {
      throw fetchError;
    }

    if (!venues || venues.length === 0) {
      return { success: true, processed: 0, message: 'No venues need geocoding' };
    }

    let processed = 0;
    let errors = 0;

    // Process each venue (with delay to respect API rate limits)
    for (const venue of venues) {
      try {
        const geocodeResult = await forwardGeocode(venue.address);
        
        if (geocodeResult) {
          const { error: updateError } = await supabase
            .from('venues')
            .update({
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
            })
            .eq('id', venue.id);

          if (!updateError) {
            processed++;
          } else {
            errors++;
            console.error(`Error updating venue ${venue.id}:`, updateError);
          }
        }

        // Rate limiting delay (1 second between requests)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errors++;
        console.error(`Error geocoding venue ${venue.id}:`, error);
      }
    }

    return {
      success: true,
      processed,
      errors,
      message: `Processed ${processed} venues, ${errors} errors`,
    };
  } catch (error) {
    console.error('Error in geocodeExistingVenues:', error);
    return { success: false, error };
  }
}