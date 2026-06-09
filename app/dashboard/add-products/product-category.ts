import { Package, Car, Home, LucideIcon } from "lucide-react";

export interface ProductCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: "teal" | "blue" | "orange" | "purple" | "primary";
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "items",
    title: "Item For Sale",
    description: "Add generic products for sale",
    icon: Package,
    href: "/dashboard/add-products/item-for-sale",
  },
  {
    id: "vehicles",
    title: "Vehicle For Sale or Rent",
    description: "List cars, trucks, or bikes",
    icon: Car,
    href: "/dashboard/add-products/vehicle-for-sale",
  },
  {
    id: "property",
    title: "Housing or Property",
    description: "List real estate for sale or rent",
    icon: Home,
    href: "/dashboard/add-products/property-for-sale",
  },
];