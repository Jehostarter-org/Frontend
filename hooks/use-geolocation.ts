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

  // IP-based coordinates from the backend (/api/users/location/detect/) — used
  // whenever the browser GPS is denied or not supported, so we still get real coords.
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

  const detectViaIP = useCallback(async (): Promise<LocationData | null> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(`${API_URL}/api/users/location/detect/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (
        data?.status === 'ok' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number' &&
        (data.lat !== 0 || data.lng !== 0)
      ) {
        const locationData: LocationData = {
          lat:          data.lat,
          lng:          data.lng,
          address:      [data.city, data.country_code].filter(Boolean).join(', ') || `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
          city:         data.city || '',
          country_code: data.country_code || '',
        };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(locationData));
        return locationData;
      }
      return null;
    } catch {
      return null;
    }
  }, [API_URL]);

  const requestLocation = useCallback(async (forceRefresh = false): Promise<LocationData | null> => {
    // The cache is only a display shortcut — an explicit "Update my location" must
    // always re-read live GPS so we never report the previous place.
    if (!forceRefresh) {
      const cached = getCachedLocation();
      if (cached) {
        setState((s) => ({ ...s, location: cached }));
        return cached;
      }
    }

    if (!navigator.geolocation) {
      // No GPS support at all — get coordinates from the IP instead
      const ipLocation = await detectViaIP();
      if (ipLocation) {
        setState({
          location:        ipLocation,
          isLocating:      false,
          error:           null,
          permissionState: 'denied',
        });
        return ipLocation;
      }
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
        const ipLocation = await detectViaIP();
        if (ipLocation) {
          setState({
            location:        ipLocation,
            isLocating:      false,
            error:           'GPS is blocked — using IP-based location instead.',
            permissionState: 'denied',
          });
          return ipLocation;
        }
        const fallback = getFallbackLocation();
        setState((s) => ({
          ...s,
          error:    'Location access denied — using your profile location.',
          location: fallback,
          permissionState: 'denied',
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
        async (err) => {
          // User denied, timed out or no fix — fall back to IP-based coordinates
          const ipLocation = await detectViaIP();
          if (ipLocation) {
            setState({
              location:        ipLocation,
              isLocating:      false,
              error:           null,
              permissionState: err && (err as any).code === 1 ? 'denied' : 'unknown',
            });
            resolve(ipLocation);
            return;
          }
          const fallback = getFallbackLocation();
          setState({
            location:        fallback,
            isLocating:      false,
            error:           'Location access denied — using your profile location.',
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
  }, [user, getFallbackLocation, detectViaIP]);

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
