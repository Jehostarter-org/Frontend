export interface ShopItem {
  id: string;
  name: string;
  location: string;
  price: string;
  image: string;
}

export interface ProgressStep {
  number: number;
  label: string;
  completed: boolean;
}

export const shopHighlights: ShopItem[] = [
  {
    id: "1",
    name: "Luxury Apartment",
    location: "Victoria Island, Lagos",
    price: "₦2,500,000/yr",
    image: "/images/house1.png",
  },
  {
    id: "2",
    name: "Toyota Camry 2021",
    location: "Ikeja, Lagos",
    price: "₦12,000,000",
    image: "/images/benx.png",
  },
  {
    id: "3",
    name: "Office Space",
    location: "Lekki Phase 1",
    price: "₦800,000/yr",
    image: "/images/house2.png",
  },
  {
    id: "4",
    name: "Luxury Apartment",
    location: "Victoria Island, Lagos",
    price: "₦2,500,000/yr",
    image: "/images/house1.png",
  },
  {
    id: "5",
    name: "Toyota Camry 2021",
    location: "Ikeja, Lagos",
    price: "₦12,000,000",
    image: "/images/benx.png",
  },
  {
    id: "6",
    name: "Office Space",
    location: "Lekki Phase 1",
    price: "₦800,000/yr",
    image: "/images/house2.png",
  },
  {
    id: "7",
    name: "Luxury Apartment",
    location: "Victoria Island, Lagos",
    price: "₦2,500,000/yr",
    image: "/images/house1.png",
  },
  {
    id: "8",
    name: "Toyota Camry 2021",
    location: "Ikeja, Lagos",
    price: "₦12,000,000",
    image: "/images/benx.png",
  },
  {
    id: "9",
    name: "Office Space",
    location: "Lekki Phase 1",
    price: "₦800,000/yr",
    image: "/images/house2.png",
  },
];

export const progressSteps: ProgressStep[] = [
  { 
    number: 1, 
    label: "Account Created", 
    completed: true 
  },
  { 
    number: 2, 
    label: "Identity Verified", 
    completed: true 
  },
  { 
    number: 3, 
    label: "Plan Selected", 
    completed: false 
  },
  { 
    number: 4, 
    label: "Welcome Pack", 
    completed: false 
  },
];

export const categories = [
  { label: "Housing", href: "/dashboard/housing", icon: "Home" }, 
  { label: "Jobs", href: "/dashboard/jobs", icon: "Briefcase" },
  { label: "Community", href: "/dashboard/community", icon: "Users" },
];

export const navigationItems = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Services", href: "/dashboard/services", icon: "Grid" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];