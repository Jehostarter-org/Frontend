"use client";

import { toast } from "sonner";
import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findNearestAirport } from "@/lib/gps-utils"; 
import { LocationPicker } from "../reuseables/locationPicker";
import { UseFormRegister, UseFormSetValue, FieldValues } from 'react-hook-form';



interface SmartAirportSelectProps {
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  error?: string;
  fieldName?: string;
  availabilitySchedule: string;
  pickupLocation: string;
  onOpenSchedule: (date: Date | undefined, time: string, formattedString: string) => void;
  onOpenLocation: (location: string) => void;
}

export function SmartAirportSelect({ register, setValue, error, fieldName, pickupLocation, onOpenLocation }: SmartAirportSelectProps) {
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const result = findNearestAirport(latitude, longitude);

        if (result.airport) {
          if (result.distance > 200) {
             toast.warning(`You seem far away. The closest airport is ${result.airport.label} (${Math.round(result.distance)}km away).`);
          } else {
             toast.success(`Nearest airport found: ${result.airport.label}`);
          }

          setValue(fieldName || "airport", result.airport.value, { shouldValidate: true });
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("GPS Error", error);
        toast.error("Could not access your location. Please select manually.");
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-1">
        <label className="text-sm font-medium text-gray-700"></label> 
        
        <Button  type="button" variant="ghost" size="sm" onClick={handleLocateMe} disabled={isLocating} className="h-6 px-2 text-teal-700 hover:text-teal-800 hover:bg-teal-50 text-xs font-medium" >
          {isLocating ? ( <Loader2 className="w-3 h-3 mr-1 animate-spin" /> ) : ( <MapPin className="w-3 h-3 mr-1" /> )} {isLocating ? "Locating..." : "Auto-select nearest"}
        </Button>
      </div>
      <LocationPicker value={pickupLocation} onSelect={onOpenLocation} />
    </div>
  );
}
