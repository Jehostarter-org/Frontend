'use client';

import { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/use-geolocation';
import { sendLocationToBackend } from '@/lib/api/location';

const DISMISS_KEY = 'jehostarter_location_prompt_dismissed';

export function LocationPermissionBanner() {
  const { permissionState, location, error, requestLocation, isLocating } = useGeolocation();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DISMISS_KEY) === '1';
  });
  const [shown, setShown] = useState(false);

  const dismiss = () => {
    setDismissed(true);
    setShown(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // storage unavailable — keep dismissal for this session only
    }
  };

  useEffect(() => {
    if (permissionState !== 'granted' && !location && !dismissed) {
      const timer = setTimeout(() => setShown(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [permissionState, location, dismissed]);

  // ✅ Fixed: use .lat and .lng (not .latitude / .longitude)
  useEffect(() => {
    if (location?.lat && location?.lng) {
      sendLocationToBackend(location.lat, location.lng, 'gps')
        .catch(console.error);
    }
  }, [location]);

  if (!shown || dismissed || (location && !error)) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="bg-teal-100 rounded-full p-2 shrink-0">
          <MapPin className="w-5 h-5 text-teal-700" />
        </div>

        <div className="flex-1">
          <p className="font-semibold text-gray-900 text-sm">
            Allow location access?
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Jehostarter uses your location to show shops, services,
            and pickups near you.
          </p>

          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={async () => {
                await requestLocation();
                setShown(false);
              }}
              disabled={isLocating}
              className="bg-teal-900 hover:bg-teal-800 text-white text-xs h-8"
            >
              {isLocating ? 'Locating...' : 'Allow Location'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={dismiss}
              className="text-xs h-8"
            >
              Not now
            </Button>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="text-gray-400 hover:text-gray-600 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-amber-600 mt-2 pl-11">
          📍 {error}
        </p>
      )}
    </div>
  );
}