"use client";

import { useDebounce } from "use-debounce";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Navigation, Home } from "lucide-react";

interface LocationSearchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: { lat: number; lon: number } | null) => void;
  error?: string;
  placeholder?: string;
  countryCode?: string;
}

interface PlaceResult {
  display_name: string;
  lat: string;
  lon: string;
  // ORS Pelias response shape
  geometry?: { coordinates: [number, number] };
  properties?: {
    label: string;
    layer?: string;
    housenumber?: string;
    street?: string;
    locality?: string;
    region?: string;
    country_code?: string;
  };
  type?: string;
}

const LAYER_PRIORITY: Record<string, number> = {
  address: 0,
  venue: 1,
  street: 2,
  neighbourhood: 3,
  locality: 4,
  localadmin: 5,
  borough: 5,
  region: 6,
  country: 7,
};

function layerLabel(layer?: string): string {
  switch (layer) {
    case "address": return "Address";
    case "venue": return "Landmark";
    case "street": return "Street";
    case "neighbourhood": return "Area";
    case "locality": return "City";
    case "localadmin": return "Area";
    case "country": return "Country";
    default: return "Place";
  }
}

// Normalise ORS Pelias feature → our flat PlaceResult
function normaliseORSFeature(f: any): PlaceResult {
  const [lon, lat] = f.geometry?.coordinates ?? [0, 0];
  const streetParts = [
    f.properties?.housenumber || "",
    f.properties?.street || "",
  ].filter(Boolean).join(" ");
  let display = f.properties?.label ?? f.properties?.name ?? "";
  if (streetParts && !display.toLowerCase().includes(streetParts.toLowerCase())) {
    display = `${streetParts}${f.properties?.locality ? ", " + f.properties.locality : ""}`;
  }
  return {
    display_name: display,
    lat: String(lat),
    lon: String(lon),
    properties: {
      label: display,
      layer: f.properties?.layer,
      housenumber: f.properties?.housenumber,
      street: f.properties?.street,
      locality: f.properties?.locality,
      region: f.properties?.region,
      country_code: f.properties?.country_code,
    },
  };
}

// Normalise Nominatim result → our flat PlaceResult
function normaliseNominatimResult(r: any): PlaceResult {
  return {
    display_name: r.display_name,
    lat: r.lat,
    lon: r.lon,
    properties: {
      label: r.display_name,
      layer:
        r.type === "house" || r.type === "building" ? "address"
        : r.type === "road" || r.type === "pedestrian" ? "street"
        : r.type === "village" || r.type === "town" || r.type === "city" ? "locality"
        : r.type === "neighbourhood" || r.type === "suburb" ? "neighbourhood"
        : r.type,
    },
    type: r.type,
  };
}

function sortByAddressPriority(results: PlaceResult[]): PlaceResult[] {
  return [...results].sort((a, b) => {
    const pa = LAYER_PRIORITY[a.properties?.layer ?? "locality"] ?? 6;
    const pb = LAYER_PRIORITY[b.properties?.layer ?? "locality"] ?? 6;
    return pa - pb;
  });
}

export function LocationSearch({
  label,
  value,
  onChange,
  onCoordinatesChange,
  error,
  placeholder = "Search for an address...",
  countryCode,
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
        try {
          const orsKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
          if (orsKey) {
            const countryParam = countryCode ? `&boundary.country=${encodeURIComponent(countryCode)}` : "";
            const res = await fetch(
              `https://api.openrouteservice.org/geocode/autocomplete?api_key=${orsKey}&text=${encodeURIComponent(debouncedQuery)}&size=8&layers=address,venue,street,neighbourhood${countryParam}`,
            );
            if (!cancelled && res.ok) {
              const data = await res.json();
              const features = (data.features ?? []).map(normaliseORSFeature);
              const sorted = sortByAddressPriority(features);
              const precise = sorted.filter((f) => {
                const layer = f.properties?.layer;
                return layer === "address" || layer === "venue" || layer === "street";
              });
              // Prefer house/street-level matches; fall back to city/area only when none
              setResults((precise.length ? precise : sorted).slice(0, 6));
              setShowDropdown(data.features?.length > 0);
              return;
            }
          }
        } catch {
          // ORS failed (CORS/network/etc.) — fall through to Nominatim
        }

        // Fallback: Nominatim
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&addressdetails=1&limit=8${countryCode ? `&countrycodes=${encodeURIComponent(countryCode)}` : ""}`,
        );
        if (!cancelled) {
          const data = await res.json();
          const normalised = (data ?? []).map(normaliseNominatimResult);
          setResults(sortByAddressPriority(normalised).slice(0, 6));
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
  }, [debouncedQuery, value, countryCode]);

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
          placeholder={placeholder}
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
          {results.map((place, idx) => {
            const layer = place.properties?.layer;
            const isHome = layer === "address" || layer === "venue";
            return (
              <div
                key={idx}
                onClick={() => handleSelect(place)}
                className="p-3 hover:bg-teal-50 cursor-pointer text-sm border-b last:border-b-0 text-gray-700"
              >
                <div className="flex items-start gap-2">
                  {isHome ? (
                    <Home className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="block truncate">{place.display_name}</span>
                    {layer && layer !== "address" && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {layerLabel(layer)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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