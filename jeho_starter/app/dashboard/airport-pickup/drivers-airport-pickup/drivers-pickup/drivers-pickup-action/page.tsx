"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Navigation } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";

type TripStatus = "NAVIGATING_TO_PICKUP" | "ARRIVED_AT_PICKUP" | "ON_TRIP";

export default function ActiveNavigation() {
  const router = useRouter();
  const [status, setStatus] = useState<TripStatus>("NAVIGATING_TO_PICKUP");

  const handleMainAction = () => {
    if (status === "NAVIGATING_TO_PICKUP") {
      setStatus("ARRIVED_AT_PICKUP");
    } else if (status === "ARRIVED_AT_PICKUP") {
      setStatus("ON_TRIP");
    } else if (status === "ON_TRIP") {
      router.push("/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-trip-summary")
    }
  };

  return (
    // We use a wrapper that prevents DashboardShell from injecting padding if possible
    <DashboardShell>
      {/* h-[calc(100vh-64px)] adjusts for a standard 64px (h-16) navbar. 
        Adjust the '64px' to match your actual header height.
      */}
      <div className="relative h-[calc(100vh-64px)] w-full bg-gray-100 overflow-hidden">
        
        {/* 1. Map Layer - Absolute Fill */}
        <div className="absolute inset-0 bg-[#e5e3df] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 font-medium italic">
              {status === "ON_TRIP" ? "Navigation to Drop-off..." : "Navigation to Airport..."}
            </p>
          </div>
        </div>

        {/* 2. Top Banner - Safe area margin */}
        <div className="absolute top-4 left-0 right-0 px-4 flex justify-center z-10">
          <div className="w-full max-w-md bg-[#2d7a7a] text-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg shrink-0">
              <Navigation className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] opacity-80 uppercase font-black tracking-widest leading-none mb-1">
                {status === "ON_TRIP" ? "Step 2: Drop-off" : "Step 1: Pickup"}
              </p>
              <h2 className="text-base font-bold truncate">
                {status === "ON_TRIP" ? "12 min • 8.4 km to destination" : "Proceed to Terminal 3, Gate A2"}
              </h2>
            </div>
          </div>
        </div>

        {/* 3. Bottom Controls - Fixed padding from bottom */}
        <div className="absolute bottom-6 left-0 right-0 px-4 z-10">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-5 border border-gray-100">
            
            {/* Status Label */}
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'ON_TRIP' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'ON_TRIP' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
              </span>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                {status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex gap-3">
              {status !== "ON_TRIP" && (
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-2xl h-14 border-gray-200 text-gray-500 hover:bg-gray-50 font-bold"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              )}
              
              <Button 
                onClick={handleMainAction}
                className={`h-14 rounded-2xl font-black text-lg transition-all active:scale-95 flex-[2] shadow-lg ${
                  status === "ON_TRIP" 
                    ? "bg-red-600 hover:bg-red-700 text-white" 
                    : "bg-black hover:bg-gray-900 text-white"
                }`}
              >
                {status === "NAVIGATING_TO_PICKUP" && "I've Arrived"}
                {status === "ARRIVED_AT_PICKUP" && "Start Trip"}
                {status === "ON_TRIP" && "End Trip"}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}