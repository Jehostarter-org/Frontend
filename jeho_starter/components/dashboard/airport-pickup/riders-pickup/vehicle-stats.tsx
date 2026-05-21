export interface VehicleOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  capacity: number;
  luggage: number;
}

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: "regular",
    name: "Regular",
    description: "Toyota Camry or similar",
    price: 30000,
    image: "/images/benx.png",
    capacity: 4,
    luggage: 2,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Mercedes Benz E-Class or similar",
    price: 55000,
    image: "/images/benx.png",
    capacity: 3,
    luggage: 3,
  },
  {
    id: "van",
    name: "Sienna / Van",
    description: "Toyota Sienna or similar",
    price: 75000,
    image: "/images/benx.png",
    capacity: 5,
    luggage: 5,
  },
  {
    id: "Bus",
    name: "Mini bus / Van",
    description: "Toyota mini bus or similar",
    price: 95000,
    image: "/images/benx.png",
    capacity: 7,
    luggage: 5,
  },
];
