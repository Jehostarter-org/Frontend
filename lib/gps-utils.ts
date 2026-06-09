// 1. Airport Data with Coordinates
export interface Airport {
  id: string;
  label: string;
  value: string;
  lat: number;
  lng: number;
}

export const AIRPORTS_WITH_COORDS: Airport[] = [
  { 
    id: "los", 
    label: "Murtala Muhammed International (LOS)", 
    value: "Murtala Muhammed International Airport (LOS)",
    lat: 6.5774, 
    lng: 3.3210 
  },
  { 
    id: "abv", 
    label: "Nnamdi Azikiwe International (ABV)", 
    value: "Nnamdi Azikiwe International Airport (ABV)",
    lat: 9.0068, 
    lng: 7.2632 
  },
  { 
    id: "kan", 
    label: "Aminu Kano International (KAN)", 
    value: "Aminu Kano International Airport (KAN)",
    lat: 12.0476, 
    lng: 8.5246 
  },
  { 
    id: "phc", 
    label: "Port Harcourt International (PHC)", 
    value: "Port Harcourt International Airport (PHC)",
    lat: 5.0156, 
    lng: 6.9496 
  },
  { 
    id: "enu", 
    label: "Akanu Ibiam International (ENU)", 
    value: "Akanu Ibiam International Airport (ENU)",
    lat: 6.4742, 
    lng: 7.5619 
  },
];

export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export function findNearestAirport(userLat: number, userLng: number): { airport: Airport | null; distance: number } {
  let nearest: Airport | null = null;
  let minDistance = Infinity;

  AIRPORTS_WITH_COORDS.forEach((airport) => {
    const distance = getDistanceFromLatLonInKm(userLat, userLng, airport.lat, airport.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = airport;
    }
  });

  return { airport: nearest, distance: minDistance };
}
