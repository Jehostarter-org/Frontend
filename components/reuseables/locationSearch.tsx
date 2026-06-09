"use client";

import { useDebounce } from "use-debounce"; 
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Navigation } from "lucide-react";

interface LocationSearchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

interface PlaceResult {
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationSearch({ label, value, onChange, error }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [debouncedQuery] = useDebounce(query, 500); 
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);


  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) return;
    if (debouncedQuery === value) return;

    const searchAddress = async () => {
      setIsLoading(true);
      try {
        const res = await fetch( `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&addressdetails=1&limit=5` );
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Geocoding error", err);
      } finally {
        setIsLoading(false);
      }
    };
    searchAddress();
  }, [debouncedQuery, value]);


  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch( `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}` );
        const data = await res.json();
        const address = data.display_name;
        
        setQuery(address);
        onChange(address); 
        setShowDropdown(false);
      } catch (error) {
        console.error("Error getting location", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleSelect = (address: string) => {
    setQuery(address);
    onChange(address);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Input value={query} onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          placeholder="Search for a destination..."
          className="pr-10 py-5"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          ) : (
            <MapPin className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map((place, idx) => (
            <div key={idx} onClick={() => handleSelect(place.display_name)} className="p-3 hover:bg-teal-50 cursor-pointer text-sm border-b last:border-b-0 text-gray-700" >
              {place.display_name}
            </div>
          ))}
        </div>
      )}

      {/* <Button type="button" variant="outline" onClick={handleCurrentLocation} className="w-full text-teal-700 border-teal-200 hover:bg-teal-50 mt-2" >
        <Navigation className="w-4 h-4 mr-2" /> Use my current location
      </Button> */}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}