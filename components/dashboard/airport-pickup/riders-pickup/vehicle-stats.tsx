// Vehicle option shape used across the airport pickup flow.
// Prices are NOT hardcoded here — they are fetched from
// GET /api/services/pricing/ and merged in at runtime so every
// country sees the correct local currency amount.

export interface VehicleOption {
  id: string;
  name: string;
  description: string;
  price: number;      // populated from API response, 0 until loaded
  image: string;
  capacity: number;
  luggage: number;
}

// Static metadata only — no prices.
// vehicle-selection.tsx merges the API prices into these before rendering.
export const VEHICLE_TEMPLATES: Omit<VehicleOption, 'price'>[] = [
  {
    id: "regular",
    name: "Regular",
    description: "Toyota Camry or similar",
    image: "/images/benx.png",
    capacity: 4,
    luggage: 2,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Mercedes Benz E-Class or similar",
    image: "/images/benx.png",
    capacity: 3,
    luggage: 3,
  },
  {
    id: "van",
    name: "Sienna / Van",
    description: "Toyota Sienna or similar",
    image: "/images/benx.png",
    capacity: 5,
    luggage: 5,
  },
  {
    id: "bus",
    name: "Mini Bus / Van",
    description: "Toyota mini bus or similar",
    image: "/images/benx.png",
    capacity: 7,
    luggage: 5,
  },
];

// Legacy export kept so nothing else in the codebase breaks during migration.
// vehicle-selection.tsx no longer uses this — it uses VEHICLE_TEMPLATES + API prices.
export const VEHICLE_OPTIONS: VehicleOption[] = VEHICLE_TEMPLATES.map((v) => ({
  ...v,
  price: 0,
}));