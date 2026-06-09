"use client";

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface InteractiveMapProps {
  className?: string;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

// 1. Moving the loading logic outside the component to keep a single "source of truth"
let googleMapsPromise: Promise<void> | null = null;

const loadGoogleMapsScript = (): Promise<void> => {
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === "your-google-maps-api-key") {
      reject(new Error("Google Maps API key is not configured."));
      return;
    }

    // Check if it already exists globally
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => {
      googleMapsPromise = null; // Reset so we can try again if it fails
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};

export default function InteractiveMap({ className = '', onLocationChange }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let map: google.maps.Map | null = null;
    let circles: google.maps.Circle[] = [];
    let labels: google.maps.Marker[] = [];
    let userMarker: google.maps.Marker | null = null;

    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        await loadGoogleMapsScript();

        // 2. Extra safety: Check if navigator exists (Client-side only)
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          throw new Error('Geolocation is not supported.');
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });

        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (onLocationChange) onLocationChange(userPos);

        // 3. Ensure we use window.google
        map = new window.google.maps.Map(mapRef.current, {
          center: userPos,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
        });

        userMarker = new window.google.maps.Marker({
          position: userPos,
          map: map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#0D9488', // Teal color to match your brand
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });

        const ranges = [1000, 2000, 5000];
        const colors = ['#F43F5E', '#F59E0B', '#0D9488']; // Pink, Amber, Teal

        circles = ranges.map((radius, index) => new window.google.maps.Circle({
          strokeColor: colors[index],
          strokeOpacity: 0.6,
          strokeWeight: 2,
          fillColor: colors[index],
          fillOpacity: 0.05,
          map: map!,
          center: userPos,
          radius: radius,
        }));

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };
    initializeMap();

    return () => {
      circles.forEach(c => c.setMap(null));
      labels.forEach(l => l.setMap(null));
      if (userMarker) userMarker.setMap(null);
    };
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center h-48 bg-slate-50 rounded-[1.5rem] border border-slate-100 ${className}`}>
        <div className="text-center p-4">
          <p className="text-rose-500 font-bold text-xs uppercase tracking-widest">Map Error</p>
          <p className="text-[10px] text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 rounded-[1.5rem] z-10 animate-pulse">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Radar...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-48 rounded-[1.5rem] border border-slate-100 shadow-inner overflow-hidden" />
    </div>
  );
}
