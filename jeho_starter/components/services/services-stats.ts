import { Plane, Home, FileText, MessageSquare, Smartphone } from "lucide-react";

export const services = [
  {
    icon: Plane,
    title: "Airport Pickup",
    description: "Click and fill the necessary details",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    href: "/dashboard/airport-pickup"
  },
  {
    icon: Home,
    title: "Temporary Housing",
    description: "Click and fill the necessary details",
    bgColor: "bg-pink-100",
    iconColor: "text-pink-500",
    href: "/dashboard/property-listing"
  },
  {
    icon: FileText,
    title: "Job Application",
    description: "Click and fill the necessary details",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    href: "/dashboard/job-application"
  },
  {
    icon: MessageSquare,
    title: "Translation Service",
    description: "Click and fill the necessary details",
    bgColor: "bg-amber-100",
    iconColor: "text-amber-500",
    href: "/"
  },
  {
    icon: Smartphone,
    title: "SIM Confirmation",
    description: "Click and fill the necessary details",
    bgColor: "bg-teal-100",
    iconColor: "text-teal-600",
    href: "/"
  },
]
