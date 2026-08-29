'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrency } from "@/components/contexts/currencyContext";
import { MapPin, Loader2 } from 'lucide-react';
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

interface NearbyItem {
  id: string;
  name: string;
  address: string;
  category: string;
  distanceKm: number;
}

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

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyPlaces({ userLocation }: { userLocation?: { lat: number; lng: number } }) {
  const { location, isLoadingLocation } = useCurrency();
  const activeLocation = userLocation
    ? { latitude: userLocation.lat, longitude: userLocation.lng }
    : (location ? { latitude: location.latitude, longitude: location.longitude } : null);

  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('healthcare');
  const [items, setItems] = useState<NearbyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<NearbyItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    searchNearby(activeLocation.latitude, activeLocation.longitude, categoryConfigs[selectedCategory].groupId)
      .then((result) => {
        if (!cancelled) setItems(result);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || 'Failed to load nearby places');
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

  if (!activeLocation) return null;

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
