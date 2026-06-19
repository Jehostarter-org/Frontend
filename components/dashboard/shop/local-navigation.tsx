import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InteractiveMap from "@/components/ui/interactive-map";
import NearbyPlaces from "@/components/dashboard/nearby-places";

interface LocalNavProps {
  onLocationChange: (loc: { lat: number; lng: number }) => void;
  mapLocation?: { lat: number; lng: number };
}

export default function LocalNavigation({ onLocationChange, mapLocation }: LocalNavProps) {
  return (
    <Card className="border-gray-200 shadow-sm h-full flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-teal-600" />
            Local Navigation
          </h3>
        </div>
        
        <div className="p-5 space-y-5 flex-1">
          <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-inner min-h-[200px] h-48 sm:h-56 md:h-64">
            <InteractiveMap onLocationChange={onLocationChange} />
            <Button size="sm" className="absolute top-3 right-3 z-10 bg-white text-gray-800 hover:bg-gray-50 shadow-md border border-gray-100 text-xs font-medium h-8" >
              <Plus className="h-3 w-3 mr-1.5 text-amber-500" />
              Upgrade to Gold
            </Button>
          </div>
          <NearbyPlaces userLocation={mapLocation} />
        </div>
      </CardContent>
    </Card>
  );
}