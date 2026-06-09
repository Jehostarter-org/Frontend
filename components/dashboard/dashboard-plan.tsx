"use client";

import Link from "next/link";
import { cn } from "@/lib/utils"; 
import { useAuth } from "../contexts/auth-context"; 
import { Crown, Star, Sparkles, ArrowUpCircle } from "lucide-react";



const PLAN_CONFIG = {
  gold: {
    label: "Gold Member",
    icon: Crown,
    className: "bg-amber-50 border-amber-200 text-amber-900 ring-1 ring-amber-100",
    iconColor: "text-amber-500 fill-amber-500",
    href: null, 
    description: "Premium Access"
  },
  regular: {
    label: "Regular Plan",
    icon: Star,
    className: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all cursor-pointer shadow-sm",
    iconColor: "text-gray-400",
    href: "/package-selection",
    description: "Upgrade to Gold"
  },
} as const;

export const PlanDisplay = () => {
  const { user } = useAuth();
  const userPlan = (user?.plan || "regular") as keyof typeof PLAN_CONFIG;
  
  const config = PLAN_CONFIG[userPlan] || PLAN_CONFIG.regular;
  const Icon = config.icon;

  const BadgeContent = (
    <div className={cn( "hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all", config.className )}>
      <Icon className={cn("w-4 h-4", config.iconColor)} />
      
      <div className="flex flex-col leading-none">
        <span>{config.label}</span>
      </div>

      {userPlan === "regular" && ( <ArrowUpCircle className="w-4 h-4 text-teal-600 ml-1 animate-pulse" /> )}
    </div>
  );

  if (config.href) {
    return (
      <Link href={config.href} title={config.description}>
        {BadgeContent}
      </Link>
    );
  }

  return BadgeContent;
};