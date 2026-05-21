import { AlertType, SystemAlert } from "./system-alert-banner";
import { AlertCircle, CheckCircle, Info, LucideIcon } from "lucide-react";

export const ALERT_CONFIG: Record<AlertType, { icon: LucideIcon; styles: string; iconColor: string; }> = {
  info: {
    icon: Info,
    styles: "bg-blue-50 border-blue-200 hover:bg-blue-100/50",
    iconColor: "text-blue-600",
  },
  warning: {
    icon: AlertCircle,
    styles: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100/50",
    iconColor: "text-yellow-600",
  },
  success: {
    icon: CheckCircle,
    styles: "bg-green-50 border-green-200 hover:bg-green-100/50",
    iconColor: "text-green-600",
  },
};

export const DEFAULT_ALERTS: SystemAlert[] = [
  {
    id: "1",
    type: "info",
    title: "Airport pickup request",
    message: "Check out your airport pickup request",
    href: "/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-navigation",
  },
  {
    id: "2",
    type: "success",
    title: "Activate Driver",
    message: "click to make yourself available for pickup request",
    href: "/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-availability"
  },
  {
    id: "3",
    type: "warning",
    title: "Apartment", 
    message: "Your apartment request is available",
    href: "/apartment",
  },
  {
    id: "4",
    type: "success",
    title: "Community Notification",
    message: "You have a new community notification",
    href: "/dashboard/community-notifications",
  }
];
