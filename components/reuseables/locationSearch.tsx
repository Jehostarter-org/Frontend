"use client";

import { useDebounce } from "use-debounce";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Navigation } from "lucide-react";

interface LocationSearchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { lat: number; lon: number } | null) => void;
  error?: string;
}

interface PlaceResult {
  display_name: string;
  lat: string;
  lon: string;
  // ORS Pelias response shape
  geometry?: { coordinates: [number, number] };
  properties?: { label: string };
  type?: string;
}

// Normalise ORS Pelias feature → our flat PlaceResult
function normaliseORSFeature(f: any): PlaceResult {
  const [lon, lat] = f.geometry?.coordinates ?? [0, 0];
  return {
    display_name: f.properties?.label ?? f.properties?.name ?? "",
    lat: String(lat),
    lon: String(lon),
  };
}

export function LocationSearch({
  label,
  value,
  onChange,
  onCoordinatesChange,
  error,
}: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [debouncedQuery] = useDebounce(query, 400);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    if (debouncedQuery === value) return;

    let cancelled = false;

    const searchAddress = async () => {
      setIsLoading(true);
      try {
        // Try ORS Pelias geocoder first (uses the project's API key)
        const orsKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
        if (orsKey) {
          const res = await fetch(
            `https://api.openrouteservice.org/geocode/autocomplete?api_key=${orsKey}&text=${encodeURIComponent(debouncedQuery)}&size=5&layers=venue,address,neighbourhood,locality,localadmin`,
          );
          if (!cancelled && res.ok) {
            const data = await res.json();
            const features = (data.features ?? []).map(normaliseORSFeature);
            setResults(features);
            setShowDropdown(features.length > 0);
            return;
          }
        }

        // Fallback: Nominatim
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&addressdetails=1&limit=5`,
        );
        if (!cancelled) {
          const data = await res.json();
          setResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch (err) {
        console.error("Geocoding error", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    searchAddress();
    return () => {
      cancelled = true;
    };
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
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const data = await res.json();
        const address = data.display_name;

        setQuery(address);
        onChange(address);
        setSelectedCoords({ lat: latitude, lon: longitude });
        onCoordinatesChange?.({ lat: latitude, lon: longitude });
        setShowDropdown(false);
      } catch (error) {
        console.error("Error getting location", error);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.display_name);
    onChange(place.display_name);
    setShowDropdown(false);

    const coords = { lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
    if (!isNaN(coords.lat) && !isNaN(coords.lon)) {
      setSelectedCoords(coords);
      onCoordinatesChange?.(coords);
    }
  };

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            // Clear coordinates when user types a new value
            setSelectedCoords(null);
            onCoordinatesChange?.(null);
          }}
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
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map((place, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(place)}
              className="p-3 hover:bg-teal-50 cursor-pointer text-sm border-b last:border-b-0 text-gray-700"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                <span>{place.display_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleCurrentLocation}
        className="w-full text-xs font-bold text-teal-600 uppercase tracking-wider hover:text-teal-700 flex items-center justify-center gap-1.5 py-2"
      >
        <Navigation className="w-3.5 h-3.5" /> Use my current location
      </button>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
