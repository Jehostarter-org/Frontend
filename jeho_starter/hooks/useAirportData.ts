import { useMemo } from 'react';
import { AIRPORTS_WITH_COORDS } from '@/lib/gps-utils';

// Mock data for terminals - in a real app this would come from an API
const TERMINALS = [
  { id: "domestic", label: "Domestic Terminal", value: "Domestic Terminal" },
  { id: "international", label: "International Terminal", value: "International Terminal" },
  { id: "cargo", label: "Cargo Terminal", value: "Cargo Terminal" },
  { id: "private", label: "Private Aviation Terminal", value: "Private Aviation Terminal" },
];

// Mock data for pickup zones - in a real app this would come from an API
const PICKUP_ZONES = [
  { id: "arrival-hall", label: "Arrival Hall", value: "Arrival Hall" },
  { id: "baggage-claim", label: "Baggage Claim Area", value: "Baggage Claim Area" },
  { id: "taxi-stand", label: "Taxi Stand", value: "Taxi Stand" },
  { id: "curbside", label: "Curbside Pickup", value: "Curbside Pickup" },
  { id: "vip-lounge", label: "VIP Lounge", value: "VIP Lounge" },
];

export function useAirportData() {
  // In a real implementation, this would fetch data from an API
  // For now, we'll return static data
  const airports = useMemo(() => AIRPORTS_WITH_COORDS, []);
  const terminals = useMemo(() => TERMINALS, []);
  const pickupZones = useMemo(() => PICKUP_ZONES, []);
  const isLoading = false; // Static data, so no loading state

  return {
    airports,
    terminals,
    pickupZones,
    isLoading,
  };
}
