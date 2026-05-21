export interface Amenity {
  id: string;
  label: string;
  icon?: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
}

export interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  type: "Apartment" | "House" | "Studio" | "Condo" | "Duplex" | "Villa" | "1Bedroom" | "2Bedroom" | "3Bedroom" ;
  price: number;
  currency: string;
  address: string;
  availability: {
    isAvailable: boolean;
    availableFrom: string;
  };
  amenities: Amenity[];
  images: PropertyImage[];
  stats: {
    guests: number;
    bedrooms: number;
    bathrooms: number;
  };
}