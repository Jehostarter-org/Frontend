export interface GeoAddress {
  display_name: string;
  city?: string;
  state?: string;
  country?: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    
    if (!response.ok) throw new Error("Geocoding failed");
    
    const data = await response.json();
    
    return (
      data.display_name || 
      `${data.address?.city || data.address?.town}, ${data.address?.country}` || 
      "Unknown Location"
    );
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`; 
  }
}