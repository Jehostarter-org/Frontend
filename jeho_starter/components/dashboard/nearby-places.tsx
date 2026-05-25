'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCurrency } from "@/components/contexts/currencyContext";
import { MapPin, Star, Phone, Globe, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSearchNearbyPlacesQuery, useGetPlaceDetailsQuery, Place } from '@/lib/api/placesApiSlice';



type PlaceCategory = 'healthcare' | 'transport' | 'markets';

interface CategoryConfig {
  label: string;
  types: Array<'hospital' | 'pharmacy' | 'bus_station' | 'taxi_stand' | 'supermarket' | 'grocery_or_supermarket'>;
  icon: string;
}

const categoryConfigs: Record<PlaceCategory, CategoryConfig> = {
  healthcare: {
    label: 'Healthcare',
    types: ['hospital', 'pharmacy'],
    icon: '🏥'
  },
  transport: {
    label: 'Transport',
    types: ['bus_station', 'taxi_stand'],
    icon: '🚗'
  },
  markets: {
    label: 'Markets',
    types: ['supermarket', 'grocery_or_supermarket'],
    icon: '🛒'
  }
};

export default function NearbyPlaces({ userLocation }: { userLocation?: { lat: number; lng: number } }) {
  const { location, isLoadingLocation } = useCurrency();
  const activeLocation = userLocation
    ? {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        city: location?.city ?? 'your area',
        region: location?.region ?? '',
      }
    : location;
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory>('healthcare');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: placesData, isLoading, error } = useSearchNearbyPlacesQuery(
    {
      location: activeLocation ? `${activeLocation.latitude},${activeLocation.longitude}` : '',
      radius: 5000,
      type: categoryConfigs[selectedCategory].types[0],
    },
    { skip: !activeLocation }
  );

  const { data: placeDetails, isLoading: isDetailsLoading } = useGetPlaceDetailsQuery(
    { placeId: selectedPlace?.place_id || '' },
    { skip: !selectedPlace }
  );

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setIsModalOpen(true);
  };

  const calculateDistance = (place: Place) => {
    if (!activeLocation) return 0;
    const R = 6371; // Earth's radius in km
    const dLat = (place.geometry.location.lat - activeLocation.latitude) * Math.PI / 180;
    const dLng = (place.geometry.location.lng - activeLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(activeLocation.latitude * Math.PI / 180) * Math.cos(place.geometry.location.lat * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  };

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

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {Object.entries(categoryConfigs).map(([key, config]) => (
          <Button key={key} variant={selectedCategory === key ? 'default' : 'outline'} onClick={() => setSelectedCategory(key as PlaceCategory)}
            className={`flex items-center px-4 gap-2 rounded-full transition-all ${ selectedCategory === key ? 'bg-teal-700 hover:bg-teal-800' : 'hover:border-teal-200' }`}
          >
            <span>{config.icon}</span>
            {config.label}
          </Button>
        ))}
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xl">
              <span>{categoryConfigs[selectedCategory].icon}</span>
              Nearby {categoryConfigs[selectedCategory].label}
            </div>
            <p className="text-xs font-normal text-muted-foreground flex items-center gap-1">
               <MapPin className="h-3 w-3" /> Results near {activeLocation.city}, {activeLocation.region}
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
              <p className="text-xs">Check your Google Maps API configuration.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {placesData?.results?.slice(0, 10).map((place) => (
                <div key={place.place_id} onClick={() => handlePlaceClick(place)} className="p-4 border rounded-xl hover:bg-teal-50/30 hover:border-teal-200 cursor-pointer transition-all group" >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 group-hover:text-teal-800">{place.name}</h4>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{place.vicinity}</p>
                      <div className="flex items-center gap-3 mt-3">
                        {place.rating && (
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded text-yellow-700 font-bold text-xs">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {place.rating}
                          </div>
                        )}
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-none font-medium">
                          <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                          {calculateDistance(place)} km away
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center p-12 text-gray-400">
                  <p>No {selectedCategory} found within 5km of your location.</p>
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

          {isDetailsLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
              <p className="text-sm text-muted-foreground">Fetching complete details...</p>
            </div>
          ) : placeDetails ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                  {placeDetails.formatted_address}
                </div>

                {placeDetails.formatted_phone_number && (
                  <div className="flex items-center gap-3 text-sm font-medium p-3">
                    <Phone className="h-5 w-5 text-teal-600" />
                    <a href={`tel:${placeDetails.formatted_phone_number}`} className="hover:text-teal-700 underline underline-offset-4">
                      {placeDetails.formatted_phone_number}
                    </a>
                  </div>
                )}

                {placeDetails.website && (
                  <div className="flex items-center gap-3 text-sm p-3">
                    <Globe className="h-5 w-5 text-teal-600" />
                    <a href={placeDetails.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 font-bold hover:underline" >
                      Official Website
                    </a>
                  </div>
                )}
              </div>

              {placeDetails.opening_hours && (
                <div className="border-t pt-4">
                  <div className="flex items-start gap-3 text-sm">
                    <Clock className="h-5 w-5 text-teal-600 mt-1" />
                    <div className="w-full">
                      <div className={`text-base font-bold mb-2 ${placeDetails.opening_hours.open_now ? 'text-green-600' : 'text-red-500'}`}>
                        {placeDetails.opening_hours.open_now ? '● Open Now' : '○ Currently Closed'}
                      </div>
                      {placeDetails.opening_hours.weekday_text && (
                        <div className="grid grid-cols-1 gap-1 text-gray-500 text-xs bg-gray-50 p-3 rounded-lg">
                          {placeDetails.opening_hours.weekday_text.map((day, index) => (
                            <div key={index} className="flex justify-between border-b border-gray-100 last:border-none py-1">
                                {day}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {placeDetails.reviews && placeDetails.reviews.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-bold text-lg mb-4">What people are saying</h4>
                  <div className="space-y-4">
                    {placeDetails.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="bg-white border p-4 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm">{review.author_name}</span>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-3 w-3 fill-yellow-500" />
                            <span className="text-xs font-bold">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 italic">"{review.text.slice(0, 150)}..."</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
