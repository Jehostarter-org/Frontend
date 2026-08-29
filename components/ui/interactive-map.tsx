"use client";

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

export default function InteractiveMap({ className = '', onLocationChange }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (typeof navigator === 'undefined' || !navigator.geolocation) {
          throw new Error('Geolocation is not supported.');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });

        if (cancelled || !mapRef.current) return;

        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (onLocationChange) onLocationChange(userPos);

        const map = leaflet.map(mapRef.current, {
          center: [userPos.lat, userPos.lng],
          zoom: 13,
          zoomControl: false,
          attributionControl: false,
        });
        leafletMapRef.current = map;

        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        setTimeout(() => map.invalidateSize(), 200);

        // User marker — pulse-style teal dot
        const userMarker = leaflet.circleMarker([userPos.lat, userPos.lng], {
          radius: 9,
          color: '#ffffff',
          weight: 2,
          fillColor: '#0D9488',
          fillOpacity: 1,
        }).addTo(map);

        const ranges = [1000, 2000, 5000];
        const colors = ['#F43F5E', '#F59E0B', '#0D9488']; // Pink, Amber, Teal

        ranges.forEach((radius, index) => {
          leaflet.circle([userPos.lat, userPos.lng], {
            radius,
            stroke: true,
            color: colors[index],
            weight: 2,
            opacity: 0.6,
            fillColor: colors[index],
            fillOpacity: 0.05,
          }).addTo(map);
        });

        map.fitBounds(userMarker.getBounds().pad(0.4), { maxZoom: 14 });

        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load map');
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full min-h-[200px] bg-slate-50 rounded-[1.5rem] border border-slate-100 ${className}`}>
        <div className="text-center p-4">
          <p className="text-rose-500 font-bold text-xs uppercase tracking-widest">Map Error</p>
          <p className="text-[10px] text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

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
      <div ref={mapRef} className="w-full h-full min-h-[200px] rounded-[1.5rem] border border-slate-100 shadow-inner overflow-hidden" />
    </div>
  );
}
