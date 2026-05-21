"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { StepFiveConfirmation } from "@/components/dashboard/airport-pickup/drivers-pickup/driver-pickup-confirmation";

export default function DriverPickupConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rideId = searchParams.get("id"); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const confirmationData = {
    rideId: rideId || "REQ-1002",
    passengerName: "Sarah Johnson",
    contactNumber: "+234 801 234 5678",
    pickupLocationFinal: "Murtala Muhammed International Airport (Terminal 1)",
    dropoffLocation: "Victoria Island, Lagos",
    estimatedArrival: "14:30 PM",
  };

  const handleContinue = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      router.push("/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-action");
    }, 1000);
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto mb-5">
        <div className="py-1">
          <Button variant="ghost" className="mb-6 bg-gray-200 hover:bg-gray-400 text-gray-700" onClick={() => router.back()} disabled={isLoading} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12 transition-all">
          <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
            {isSubmitted ? "Pickup Confirmed!" : "Riders Pickup Details"}
          </h1>

          <div className="mb-10 max-w-md mx-auto">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ease-in-out ${isSubmitted ? 'bg-green-500' : 'bg-[#2d7a7a]'}`} style={{ width: "100%" }} />
            </div>
          </div>

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
              <p className="text-gray-600 font-medium">Updating ride status...</p>
            </div>
          ) : (
            <>
              <StepFiveConfirmation data={confirmationData} />

              <div className="flex justify-center mt-10">
                <Button onClick={handleContinue} disabled={isLoading} className="w-full max-w-sm bg-[#2d7a7a] hover:bg-[#246060] text-white py-7 text-lg font-semibold shadow-md transition-all active:scale-[0.98]" >
                  {isLoading ? (
                    <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing... </>
                  ) : (
                    "Accept Pickup"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}