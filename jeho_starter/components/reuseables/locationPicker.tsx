// components/reuseables/locationPicker.tsx

"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { LOCATIONS } from "@/components/dashboard/airport-pickup/drivers-pickup/driver details";

interface LocationPickerProps {
  value: string;
  onSelect: (location: string) => void;
}

export function LocationPicker({ value, onSelect }: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredLocations = LOCATIONS.filter(loc =>
    loc.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLocation = LOCATIONS.find(loc => loc.value === value);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Pickup Location
      </label>

      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-teal-400 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <span className={selectedLocation ? "text-gray-900" : "text-gray-400"}>
              {selectedLocation?.label || "Select a pickup location"}
            </span>
          </div>
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredLocations.map((location) => (
                  <button
                    key={location.value}
                    onClick={() => {
                      onSelect(location.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{location.label}</span>
                  </button>
                ))}
                {filteredLocations.length === 0 && (
                  <div className="px-4 py-8 text-center text-gray-500">
                    No locations found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {value && selectedLocation && (
        <div className="flex items-center gap-2 text-sm text-teal-700">
          <MapPin className="h-3 w-3" />
          <span>Pickup location set: {selectedLocation.label}</span>
        </div>
      )}
    </div>
  );
}