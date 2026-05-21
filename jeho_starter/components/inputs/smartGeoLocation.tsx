"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { findNearestAirport } from "@/lib/gps-utils"; 
import { MapPin, Loader2, Plane } from "lucide-react";
import { useCurrentLocation } from "@/hooks/use-geolocation";
import { LocationPicker } from "../reuseables/locationPicker";

interface SmartLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: "airport" | "address";
  error?: string;
}

export function SmartLocationInput({ value, onChange, mode, error }: SmartLocationInputProps) {
  const { getCurrentLocation, isLocating } = useCurrentLocation();

  const handleAutoDetect = async () => {
    const locationData = await getCurrentLocation();

    if (!locationData) return;

    if (mode === "airport") {
      const result = findNearestAirport(locationData.lat, locationData.lng);

      if (result.airport) {
        if (result.distance > 50) {
            toast.warning(`You are ${Math.round(result.distance)}km away from the nearest supported airport.`);
        } else {
            toast.success(`Nearest airport found: ${result.airport.label}`);
        }
        onChange(result.airport.label);
      } else {
        toast.error("No supported airport found nearby.");
      }

    } else {
      toast.success("Location updated");
      onChange(locationData.address);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end mb-1">
        <label className="text-sm font-medium text-gray-700"></label>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAutoDetect}
          disabled={isLocating}
          className="h-6 px-2 text-teal-700 hover:text-teal-800 hover:bg-teal-50 text-xs font-medium"
        >
          {isLocating ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : mode === "airport" ? (
            <Plane className="w-3 h-3 mr-1" />
          ) : (
            <MapPin className="w-3 h-3 mr-1" />
          )}
          {isLocating ? "Detecting..." : mode === "airport" ? "Find nearest airport" : "Use my location"}
        </Button>
      </div>

      <LocationPicker value={value} onSelect={onChange} />
      
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
