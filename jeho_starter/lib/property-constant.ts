// /lib/property-constant.ts

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "duplex", label: "Duplex" },      // Fixed: changed from "house" to "duplex"
  { value: "studio", label: "Studio" },
  { value: "villa", label: "Villa" },
  { value: "condo", label: "Condo" },
  { value: "1bedroom", label: "One Bedroom" },
  { value: "2bedroom", label: "Two Bedroom" },
  { value: "3bedroom", label: "Three Bedroom" },
];

export const AMENITIES_LIST = [
  { id: "wifi", label: "WiFi" },
  { id: "water", label: "Water" },
  { id: "gym", label: "Gym Access" },
  { id: "pet", label: "Pet-friendly" },
  { id: "security", label: "Security" },
  { id: "dishwasher", label: "Dishwasher" },
  { id: "parking", label: "Parking space" },
  { id: "cctv", label: "CCTV Surveillance" },
  { id: "swimming", label: "Swimming Pool" },
  { id: "machine", label: "Washing Machine" },
  { id: "electricity", label: "Electricity" },
  { id: "ac", label: "Air-Conditioning/Fans" },
  { id: "fencing", label: "Electric Fencing" },
  { id: "detectors", label: "Smoke Detectors" },
  { id: "generator", label: "Generator/Inverter" },
];

export const DURATION_TYPES = [
  { value: "short", label: "Short Stay (1-3 Months)" },
  { value: "medium", label: "Medium Term (6 Months)" },
  { value: "long", label: "Long Term (1 Year+)" },
];

export const HOUSE_RULES_LIST = [
  { id: "no-pets", label: "No Pets" },
  { id: "no-smoking", label: "No smoking" },
  { id: "no-parties", label: "No Parties" },
  { id: "quiet-hours", label: "Quiet hours" },
  { id: "No-subletting", label: "No Subletting" },
  { id: "parking-rules", label: "Parking Rules" },
  { id: "utility-usage", label: "Utility Usage" },
  { id: "garden-lawn", label: "Garden/Lawn Care" },
  { id: "trash-disposal", label: "Trash Disposal" },
  { id: "maximum-occupancy", label: "Maximum Occupancy" },
  { id: "inspection-notice", label: "Inspection Notice" },
  { id: "no-visitors", label: "No sleeping over for visitors" },
  { id: "deposit-required", label: "Security deposit required" },
];

export const MOCK_RESULTS = [
  { id: "1", title: "Modern Apartment - VI", desc: "2 Beds • 1 Bath • WiFi", price: 150000 },
  { id: "2", title: "Cozy Studio - Lekki", desc: "1 Bed • Kitchen • AC", price: 85000 },
  { id: "3", title: "Luxury Flat - Ikoyi", desc: "3 Beds • Pool • Gym", price: 450000 },
];