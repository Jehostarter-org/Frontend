'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrency } from "@/components/contexts/currencyContext";
import { MapPin, Loader2, LocateFixed, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type PlaceCategory = 'healthcare' | 'transport' | 'markets';

interface NearbyItem {
  id: string;
  name: string;
  address: string;
  category: string;
  distanceKm: number;
}

interface CategoryConfig {
  label: string;
  groupId: number;
  icon: string;
  sample: string;
}

const categoryConfigs: Record<PlaceCategory, CategoryConfig> = {
  healthcare: {
    label: 'Healthcare',
    groupId: 200,
    icon: '🏥',
    sample: 'Local hospitals, clinics and pharmacies',
  },
  transport: {
    label: 'Transport',
    groupId: 580,
    icon: '🚗',
    sample: 'Local bus stops, taxi stands and transport',
  },
  markets: {
    label: 'Markets',
    groupId: 420,
    icon: '🛒',
    sample: 'Local supermarkets and markets',
  },
};

function orsHeader() {
  return {
    'Authorization': process.env.NEXT_PUBLIC_ORS_API_KEY || '',
    'Content-Type': 'application/json',
  };
}

async function searchNearby(lat: number, lon: number, groupId: number): Promise<NearbyItem[]> {
  const res = await fetch('https://api.openrouteservice.org/pois', {
    method: 'POST',
    headers: orsHeader(),
    body: JSON.stringify({
      request: 'pois',
      geometry: {
        geojson: { type: 'Point', coordinates: [lon, lat] },
        buffer: 2000,
      },
      filters: { category_group_ids: [groupId] },
      limit: 10,
      sortby: 'distance',
    }),
  });

  if (!res.ok) {
    const reason = await res.text().catch(() => '');
    throw new Error(`Search failed (${res.status}${reason ? `: ${reason}` : ''})`);
  }

  const data = await res.json();
  const features = data?.features ?? [];
  return features
    .map((f: any) => {
      const p = f?.properties ?? {};
      const tags = p.osm_tags ?? {};
      const firstCategory =
        (Object.values(p.category_ids ?? {})[0] as { category_name?: string; category_group?: string } | undefined) ?? {};
      const [lonC, latC] = f?.geometry?.coordinates ?? [0, 0];
      const meters = typeof p.distance === 'number'
        ? p.distance
        : haversine(lat, lon, latC, lonC);
      const parts = [
        tags['addr:housenumber'],
        tags['addr:street'],
        tags['addr:city'],
        tags['addr:postcode'],
      ].filter(Boolean);
      return {
        id: String(p.osm_id ?? `${lonC}-${latC}`),
        name: tags.name || firstCategory.category_name || 'Unnamed place',
        address: parts.join(', ') || `${latC.toFixed(4)}, ${lonC.toFixed(4)}`,
        category: (firstCategory.category_name || 'nearby').replace(/_/g, ' '),
        distanceKm: Math.round((meters / 1000) * 10) / 10,
      };
    })
    .filter((item: NearbyItem) => item.name);
}

// ── Fallback source: OpenStreetMap Overpass (works when the ORS key/API is down) ──

const OVERPASS_SELECTORS: Record<PlaceCategory, string> = {
  healthcare: `(node["amenity"~"^(hospital|clinic)$"](around:2000,{lat},{lon});way["amenity"~"^(hospital|clinic)$"](around:2000,{lat},{lon});node["amenity"="pharmacy"](around:2000,{lat},{lon}););out center 20;`,
  transport: `(node["highway"="bus_stop"](around:2000,{lat},{lon});node["amenity"="taxi"](around:2000,{lat},{lon});node["railway"~"^(station|tram_stop)$"](around:2000,{lat},{lon}););out center 20;`,
  markets: `(node["amenity"="marketplace"](around:2000,{lat},{lon});node["shop"~"^(supermarket|grocery|general)$"](around:2000,{lat},{lon}););out center 20;`,
};

function toNearbyItems(elements: any[], lat: number, lon: number): NearbyItem[] {
  return (elements ?? [])
    .map((f: any) => {
      const tags = f?.tags ?? {};
      const coord = typeof f?.lat === 'number'
        ? { lat: f.lat, lon: f.lon }
        : (f?.center && typeof f.center.lat === 'number'
          ? { lat: f.center.lat, lon: f.center.lon }
          : { lat: 0, lon: 0 });
      const parts = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city']].filter(Boolean);
      const category = tags.healthcare === 'pharmacy' ? 'pharmacy'
        : (tags.amenity || tags.shop || tags.healthcare || tags.highway || tags.railway || 'nearby');
      return {
        id: String(f?.id ?? `${coord.lat}-${coord.lon}`),
        name: tags.name || tags['name:en'] || 'Unnamed place',
        address: parts.join(', ') || `${coord.lat.toFixed(4)}, ${coord.lon.toFixed(4)}`,
        category: String(category).replace(/_/g, ' '),
        distanceKm: Math.round((haversine(lat, lon, coord.lat, coord.lon) / 1000) * 10) / 10,
      };
    })
    .filter((item: NearbyItem) => item.name && item.name !== 'Unnamed place');
}

async function searchNearbyOverpass(lat: number, lon: number, category: PlaceCategory): Promise<NearbyItem[]> {
  const data = OVERPASS_SELECTORS[category]
    .replaceAll('{lat}', String(lat))
    .replaceAll('{lon}', String(lon));
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(data)}`,
  });
  if (!res.ok) throw new Error(`Overpass failed (${res.status})`);
  const json = await res.json();
  return toNearbyItems(json?.elements ?? [], lat, lon);
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

export default function NearbyPlaces({ userLocation }: { userLocation?: { lat: number; lng: number } }) {
  const { location, isLoadingLocation } = useCurrency();
  const didAutoDetect = useRef(false);

  const [localLocation, setLocalLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('healthcare');
  const [items, setItems] = useState<NearbyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<NearbyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contextLocation =
    location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number'
      ? { latitude: location.latitude, longitude: location.longitude }
      : null;

  // Same resolution chain as the dashboard map: prop → detected → IP context → saved
  const activeLocation = userLocation
    ? { latitude: userLocation.lat, longitude: userLocation.lng }
    : (localLocation ?? contextLocation);

  const requestLocation = useCallback(async () => {
    if (isDetecting) return;
    setIsDetecting(true);
    setError(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 300000,
          });
        });
        setLocalLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        return;
      }
    } catch {
      /* denied/unavailable — fall through below */
    } finally {
      setIsDetecting(false);
    }
    const saved = readSavedLocation();
    if (saved) {
      setLocalLocation({ latitude: saved.lat, longitude: saved.lng });
    } else if (contextLocation) {
      setLocalLocation(contextLocation);
    }
  }, [contextLocation, isDetecting]);

  // Auto-detect once if we still have no location (mirrors the map's behaviour)
  useEffect(() => {
    if (didAutoDetect.current) return;
    if (activeLocation) return;
    didAutoDetect.current = true;
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocation, requestLocation]);

  const categoryKey = useMemo(
    () => (activeLocation ? `${activeLocation.latitude},${activeLocation.longitude}` : ''),
    [activeLocation],
  );

  useEffect(() => {
    let cancelled = false;
    if (!activeLocation) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    setUsedFallback(false);
    const lat = activeLocation.latitude;
    const lon = activeLocation.longitude;
    const groupId = categoryConfigs[selectedCategory].groupId;

    searchNearby(lat, lon, groupId)
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch(async () => {
        if (cancelled) return;
        // Primary provider failed — fall back to OpenStreetMap so places still show
        try {
          const over = await searchNearbyOverpass(lat, lon, selectedCategory);
          if (cancelled) return;
          setItems(over);
          setUsedFallback(true);
        } catch {
          if (!cancelled) setError('Could not reach a places service. Check your connection and try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryKey, selectedCategory]);

  const handlePlaceClick = useCallback((place: NearbyItem) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  }, []);

  if (isLoadingLocation) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-muted-foreground font-medium">Detecting your location...</p>
        </CardContent>
      </Card>
    );
  }

  // No location at all — ask for permission instead of silently rendering nothing
  if (!activeLocation) {
    return (
      <div className="space-y-4">
        <Card className="border-dashed border-2 border-teal-200 bg-teal-50/40">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-teal-600" />
            </div>
            <p className="text-sm font-semibold text-gray-800">Find {categoryConfigs[selectedCategory].sample.toLowerCase()}</p>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Allow location access to see nearby {categoryConfigs[selectedCategory].label.toLowerCase()} around you.
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={requestLocation} disabled={isDetecting} className="bg-teal-700 hover:bg-teal-800 gap-2">
                {isDetecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                {isDetecting ? 'Locating...' : 'Detect my location'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = categoryConfigs[selectedCategory];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {Object.entries(categoryConfigs).map(([key, cfg]) => (
          <Button key={key} variant={selectedCategory === key ? 'default' : 'outline'} onClick={() => setSelectedCategory(key as PlaceCategory)}
            className={`flex items-center px-4 gap-2 rounded-full transition-all ${ selectedCategory === key ? 'bg-teal-700 hover:bg-teal-800' : 'hover:border-teal-200' }`}
          >
            <span>{cfg.icon}</span>
            {cfg.label}
          </Button>
        ))}
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xl">
              <span>{config.icon}</span>
              Nearby {config.label}
            </div>
            <p className="text-xs font-normal text-muted-foreground flex items-center gap-1">
               <MapPin className="h-3 w-3" /> {config.sample}
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              <span className="text-sm text-muted-foreground">Searching local {selectedCategory}...</span>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg border border-red-100">
              <p className="font-semibold">Service Unavailable</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {usedFallback && (
                <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5 flex items-center gap-1.5">
                  <Navigation className="h-3 w-3 shrink-0" />
                  Live map data could not be fetched — showing OpenStreetMap results instead.
                </p>
              )}
              {items.length > 0 ? (
                items.map((place) => (
                  <div key={place.id} onClick={() => handlePlaceClick(place)} className="p-4 border rounded-xl hover:bg-teal-50/30 hover:border-teal-200 cursor-pointer transition-all group" >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-teal-800">{place.name}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{place.address}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-none font-medium capitalize">
                            {place.category}
                          </Badge>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none font-medium">
                            <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                            {place.distanceKm} km away
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-12 text-gray-400">
                  <p>No {selectedCategory} found within 2km of your location.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedPlace?.name}</DialogTitle>
          </DialogHeader>
          {selectedPlace && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                <MapPin className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                {selectedPlace.address}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-none font-medium capitalize">
                  {selectedPlace.category}
                </Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none font-medium">
                  <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                  {selectedPlace.distanceKm} km away
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}