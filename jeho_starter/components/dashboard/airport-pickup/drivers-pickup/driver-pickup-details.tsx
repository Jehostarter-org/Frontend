"use client";

import { LocationPicker } from "@/components/reuseables/locationPicker";
import { DateTimePicker } from "@/components/reuseables/dateTimePicker";


interface StepThreeProps {
  availabilitySchedule: string;
  pickupLocation: string;
  onOpenSchedule: (date: Date | undefined, time: string, formattedString: string) => void;
  onOpenLocation: (location: string) => void;
}

export default function StepThreeDetails({ availabilitySchedule, pickupLocation, onOpenSchedule, onOpenLocation }: StepThreeProps) {
  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-semibold text-center mb-8 text-gray-900">
        Driver`s Details
      </h2>

      <div className="space-y-4">
        <DateTimePicker value={availabilitySchedule} onSave={onOpenSchedule} />
        <LocationPicker value={pickupLocation} onSelect={onOpenLocation} />
      </div>
    </div>
  );
}


