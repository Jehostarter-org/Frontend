import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/lib/features/auth/authSlice';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country_code: string;
}

interface GeolocationState {
  location: LocationData | null;
  isLocating: boolean;
  error: string | null;
  permissionState: 'granted' | 'denied' | 'prompt' | 'unknown';
}

// Persist location in localStorage so it survives page navigations,
// refreshes, and browser restarts — the user's operating location is held
// until they explicitly change it.
const LOCATION_KEY = 'jehostarter_location';

export const useGeolocation = () => {
  const user = useSelector(selectCurrentUser);

  const [state, setState] = useState<GeolocationState>({
    location:        null,
    isLocating:      false,
    error:           null,
    permissionState: 'unknown',
  });

  // Restore the previously obtained location on mount so it does not
  // disappear on refresh/navigation and the prompt does not resurface.
  useEffect(() => {
    const cached = getCachedLocation();
    if (cached) {
      setState((s) => ({
        ...s,
        location:        cached,
        permissionState: 'granted',
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if we already have a cached location from a previous visit
  const getCachedLocation = (): LocationData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = localStorage.getItem(LOCATION_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  // Fall back to user's profile city/country when GPS is unavailable
  const getFallbackLocation = useCallback((): LocationData | null => {
    if (!user?.current_country) return null;
    return {
      lat:          0,
      lng:          0,
      address:      `${user.city || ''}, ${user.current_country}`.trim(),
      city:         user.city || '',
      country_code: user.current_country,
    };
  }, [user]);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    // Return cached location if available
    const cached = getCachedLocation();
    if (cached) {
      setState((s) => ({ ...s, location: cached }));
      return cached;
    }

    if (!navigator.geolocation) {
      const fallback = getFallbackLocation();
      setState((s) => ({
        ...s,
        error:           'Geolocation not supported — using profile location.',
        location:        fallback,
        permissionState: 'denied',
      }));
      return fallback;
    }

    // Check current permission state without triggering the popup
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setState((s) => ({ ...s, permissionState: permission.state }));

      if (permission.state === 'denied') {
        const fallback = getFallbackLocation();
        setState((s) => ({
          ...s,
          error:    'Location access denied — showing results for your profile location.',
          location: fallback,
        }));
        return fallback;
      }
    } catch {
      // Some browsers don't support permissions.query — continue anyway
    }

    setState((s) => ({ ...s, isLocating: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Reverse geocode using OpenStreetMap (free, no API key needed)
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              { headers: { 'User-Agent': 'JehoStarter/1.0' } },
            );

            const data = await res.json();
            const addr = data.address || {};

            const locationData: LocationData = {
              lat:          latitude,
              lng:          longitude,
              address:      data.display_name || `${latitude}, ${longitude}`,
              city:         addr.city || addr.town || addr.village || addr.county || '',
              country_code: (addr.country_code || '').toUpperCase(),
            };

            // Persist the resolved location
            localStorage.setItem(LOCATION_KEY, JSON.stringify(locationData));

            setState({
              location:        locationData,
              isLocating:      false,
              error:           null,
              permissionState: 'granted',
            });

            resolve(locationData);
          } catch {
            // Geocoding failed — still have coordinates
            const locationData: LocationData = {
              lat:          latitude,
              lng:          longitude,
              address:      `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city:         user?.city || '',
              country_code: user?.current_country || '',
            };

            localStorage.setItem(LOCATION_KEY, JSON.stringify(locationData));
            setState((s) => ({ ...s, location: locationData, isLocating: false }));
            resolve(locationData);
          }
        },
        (err) => {
          // User denied or timeout
          const fallback = getFallbackLocation();
          setState({
            location:        fallback,
            isLocating:      false,
            error:           'Location access denied — showing results for your profile location.',
            permissionState: 'denied',
          });
          resolve(fallback);
        },
        {
          enableHighAccuracy: true,
          timeout:            10000,
          maximumAge:         300000, // 5 minutes
        },
      );
    });
  }, [user, getFallbackLocation]);

  // Clear cached location (e.g. when user changes city in profile)
  const clearLocation = () => {
    localStorage.removeItem(LOCATION_KEY);
    setState({
      location:        null,
      isLocating:      false,
      error:           null,
      permissionState: 'unknown',
    });
  };

  return {
    ...state,
    data: state.location,
    requestLocation,
    getCurrentLocation: requestLocation,
    clearLocation,
    // Convenience: the coordinates to send to your backend listings query
    queryParams: state.location
      ? {
          userLat:  state.location.lat,
          userLng:  state.location.lng,
          city:     state.location.city,
          countryCode: state.location.country_code,
        }
      : {
          userLat:     undefined,
          userLng:     undefined,
          city:        user?.city,
          countryCode: user?.current_country,
        },
  };
};

export const useCurrentLocation = useGeolocation;
