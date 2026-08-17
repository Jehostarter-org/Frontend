import { Globe, Bell, Inbox, Package, ShoppingCart, Tag, Car, Building, Shirt, Laptop, Sofa, Baby, BookOpen, Wrench, Users, Zap, Boxes } from "lucide-react";

export const navigationItems = [
  { icon: Globe, label: "Shop", href: "/dashboard/product/marketplace" },
  { icon: Bell, label: "Activity", href: "/dashboard/notification" },
  { icon: Inbox, label: "Inbox", href: "/dashboard/inbox" },
  { icon: Package, label: "Membership", href: "/customer-details/packages" },
  // { icon: ShoppingCart, label: "Buying", href: "/dashboard/buyers-cart" },
  // { icon: Tag, label: "Selling", href: "/dashboard/sellers-product" },
  { icon: Users, label: "Community Groups", href: "/dashboard/community", },
]

export const categories = [
  { icon: Car, label: "Vehicles", href: "/dashboard/product/vehicles", },
  { icon: Building, label: "Housing & Rent", href: "/dashboard/product/housing", },
  { icon: Shirt, label: "Fashion & Personal Items", href: "/dashboard/product/fashion", },
  { icon: Laptop, label: "Electronics", href: "/dashboard/product/electronics", },
  { icon: Sofa, label: "Home & Furniture", href: "/dashboard/product/furniture", },
  { icon: Baby, label: "Baby & Kids", href: "/dashboard/product/baby-kids-store", },
  { icon: BookOpen, label: "Books & Study Aids", href: "/dashboard/product/books", },
  { icon: Wrench, label: "Work Tools & Equipment", href: "/dashboard/product/equipment-tools", },
  { icon: Boxes, label: "Other", href: "/dashboard/product/other", },
]