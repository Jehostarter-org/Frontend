"use client";

import { useMemo } from "react";
import { useGetAirportsQuery, Airport } from "@/lib/api/riderApiSlice";
import { AIRPORTS_WITH_COORDS } from "@/lib/gps-utils";

// Terminals are generic — they don't change per airport
const TERMINALS = [
  { id: "domestic", label: "Domestic Terminal", value: "Domestic Terminal" },
  { id: "international", label: "International Terminal", value: "International Terminal" },
  { id: "cargo", label: "Cargo Terminal", value: "Cargo Terminal" },
  { id: "private", label: "Private Aviation Terminal", value: "Private Aviation Terminal" },
];

// Pickup zones are generic airport meeting points
const PICKUP_ZONES = [
  { id: "arrival-hall", label: "Arrival Hall", value: "Arrival Hall" },
  { id: "baggage-claim", label: "Baggage Claim Area", value: "Baggage Claim Area" },
  { id: "taxi-stand", label: "Taxi Stand", value: "Taxi Stand" },
  { id: "curbside", label: "Curbside Pickup", value: "Curbside Pickup" },
  { id: "vip-lounge", label: "VIP Lounge", value: "VIP Lounge" },
];

// Fallback airports used only if the API is unreachable
const FALLBACK_AIRPORTS = AIRPORTS_WITH_COORDS.map((a) => ({
  ...a,
  country: "NG",
}));

export function useAirportData() {
  const { data, isLoading, isError } = useGetAirportsQuery();

  const airports = useMemo(() => {
    if (data?.airports && data.airports.length > 0) {
      return data.airports as Airport[];
    }
    // Fallback to local hardcoded data when the API is unavailable
    return FALLBACK_AIRPORTS;
  }, [data]);

  const supportedCountries = useMemo(
    () => data?.supported_countries ?? [],
    [data],
  );

  return {
    airports,
    terminals: TERMINALS,
    pickupZones: PICKUP_ZONES,
    supportedCountries,
    isLoading,
    isError,
  };
}
