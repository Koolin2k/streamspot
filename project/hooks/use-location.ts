import { useState, useEffect } from 'react';
import { Coordinates, DEFAULT_LOCATION } from '@/lib/utils/geo';

interface LocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

interface UseLocationReturn extends LocationState {
  requestLocation: () => void;
  clearError: () => void;
}

/**
 * Hook to get and manage user's geolocation
 */
export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<LocationState>({
    coordinates: null,
    error: null,
    loading: false,
    permissionDenied: false,
  });

  // Check if geolocation is supported
  const isGeolocationSupported = typeof window !== 'undefined' && 'geolocation' in navigator;

  const requestLocation = () => {
    if (!isGeolocationSupported) {
      setState({
        coordinates: DEFAULT_LOCATION,
        error: 'Geolocation is not supported by your browser. Using default location.',
        loading: false,
        permissionDenied: false,
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          error: null,
          loading: false,
          permissionDenied: false,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location.';
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Using default location.';
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Using default location.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default location.';
            break;
        }

        setState({
          coordinates: DEFAULT_LOCATION,
          error: errorMessage,
          loading: false,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Auto-request location on mount
  useEffect(() => {
    // Check if we have a cached location in localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('user_location');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;
          // Use cached if less than 5 minutes old
          if (age < 300000) {
            setState({
              coordinates: parsed.coordinates,
              error: null,
              loading: false,
              permissionDenied: false,
            });
            return;
          }
        } catch (e) {
          // Invalid cache, continue to request
        }
      }
    }

    // Request fresh location
    requestLocation();
  }, []);

  // Cache location when it changes
  useEffect(() => {
    if (state.coordinates && typeof window !== 'undefined' && !state.permissionDenied) {
      localStorage.setItem(
        'user_location',
        JSON.stringify({
          coordinates: state.coordinates,
          timestamp: Date.now(),
        })
      );
    }
  }, [state.coordinates, state.permissionDenied]);

  return {
    ...state,
    requestLocation,
    clearError,
  };
}
