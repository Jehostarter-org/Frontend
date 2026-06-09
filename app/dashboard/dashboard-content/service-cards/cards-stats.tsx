import { HelpingHand, Headphones, FileUp } from "lucide-react"

export const services = [
  {
    icon: FileUp,
    title: "Eligibility Check",
    description: "Upload required documents",
    buttonText: "Confirm",
    iconBg: "bg-green-500",
    href: "/dashboard/eligibility-check"
  },
  {
    icon: Headphones,
    title: "Request Support",
    description: "Get help from our team",
    buttonText: "Confirm",
    iconBg: "bg-cyan-500",
    href: "/support"
  },
  {
    icon: HelpingHand,
    title: "Services",
    description: "Check out our other services",
    buttonText: "Check Out",
    iconBg: "bg-yellow-500",
    href: "/services"
  },
]