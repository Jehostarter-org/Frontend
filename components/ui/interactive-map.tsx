"use client";

import { Loader2, LocateFixed } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useCurrency } from '@/components/contexts/currencyContext';

interface InteractiveMapProps {
  className?: string;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let L: any = null;

const loadLeaflet = async () => {
  if (!L) L = await import('leaflet');
  return L;
};

const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 }; // Lagos — shown only when no location is known at all

function readSavedLocation(): { lat: number; lng: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('jehostarter_currency_location');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') {
      return { lat: parsed.latitude, lng: parsed.longitude };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export default function InteractiveMap({ className = '', onLocationChange }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  const { location } = useCurrency();
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const contextLocation =
    location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number'
      ? { lat: location.latitude, lng: location.longitude }
      : null;

  const retry = () => {
    setNotice(null);
    setIsLoading(true);
    setAttempt((a) => a + 1);
  };

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    let cancelled = false;

    (async () => {
      try {
        const leaflet = await loadLeaflet();
        if (cancelled || !mapRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((mapRef.current as any)._leaflet_id) return;

        // Resolve the best-known position:
        //   1. Live browser GPS (may be denied/blocked)
        //   2. IP-detected location from the currency context
        //   3. Last saved location from localStorage
        let userPos: { lat: number; lng: number } | null = null;

        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 300000,
              });
            });
            userPos = { lat: position.coords.latitude, lng: position.coords.longitude };
          } catch {
            /* GPS denied/unavailable — keep trying the fallbacks below */
          }
        }

        if (!userPos && contextLocation) userPos = contextLocation;
        if (!userPos) {
          const saved = readSavedLocation();
          if (saved) userPos = saved;
        }

        // Let nearby-places know where we ended up (only when it's real)
        if (userPos && onLocationChange) onLocationChange(userPos);

        const center = userPos ?? DEFAULT_CENTER;

        const map = leaflet.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: userPos ? 13 : 5,
          zoomControl: false,
          attributionControl: false,
        });
        leafletMapRef.current = map;

        leaflet
          .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
          })
          .addTo(map);

        // Fix the grey-box bug when the container resizes after mount
        const invalidateSize = () => map.invalidateSize();
        window.addEventListener('resize', invalidateSize);
        setTimeout(() => map.invalidateSize(), 200);
        map.on('load', invalidateSize);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).__invalidator = { remove: () => window.removeEventListener('resize', invalidateSize) };

        if (userPos) {
          const userMarker = leaflet.circleMarker([userPos.lat, userPos.lng], {
            radius: 9,
            color: '#ffffff',
            weight: 2,
            fillColor: '#0D9488',
            fillOpacity: 1,
          }).addTo(map);

          const ranges = [1000, 2000, 5000];
          const colors = ['#F43F5E', '#F59E0B', '#0D9488'];

          ranges.forEach((radius, index) => {
            leaflet
              .circle([userPos.lat, userPos.lng], {
                radius,
                stroke: true,
                color: colors[index],
                weight: 2,
                opacity: 0.6,
                fillColor: colors[index],
                fillOpacity: 0.05,
              })
              .addTo(map);
          });

          map.fitBounds(userMarker.getBounds().pad(0.4), { maxZoom: 14 });

          if (!('geolocation' in navigator) || location === null) {
            setNotice('Precise GPS was not available — showing an approximate location.');
          }
        } else {
          setNotice(
            'Location access is blocked. Click below to try again, or allow location to see places near you.',
          );
        }

        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setNotice(err instanceof Error ? err.message : 'Failed to load map');
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapRef.current as any)?.__invalidator?.remove?.();
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  return (
    <div className={`relative h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-[1.5rem] z-10 animate-pulse">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Radar...</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="w-full h-full min-h-[200px] rounded-[1.5rem] border border-slate-100 shadow-inner overflow-hidden"
      />

      {!isLoading && notice && (
        <div className="absolute left-2 right-2 bottom-2 z-[500] flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-md px-3 py-2">
          <p className="text-[10px] text-slate-600 leading-snug flex-1">{notice}</p>
          <button
            type="button"
            onClick={retry}
            className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-full px-2.5 py-1 transition-colors"
          >
            <LocateFixed className="h-3 w-3" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}