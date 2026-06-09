"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/reuseables/progress-bar";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { INITIAL_DATA } from "@/components/dashboard/airport-pickup/drivers-pickup/driver-pickup-form-stats";
import StepThreeDetails from "@/components/dashboard/airport-pickup/drivers-pickup/driver-pickup-details";

export default function DriverPickupAvailability() {
  const router = useRouter()
  const [data, setData] = useState(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContinue = useCallback(async () => {
    if (!data.availabilitySchedule || !data.pickupLocation) {
       alert("Please fill in all details") 
       return
    }

    setIsSubmitting(true)
    router.push("/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-navigation")
  }, [data, router])

  const handleOpenSchedule = useCallback((date: Date | undefined, time: string, formattedString: string) => {
    setData(prev => ({ ...prev, availabilitySchedule: formattedString }))
  }, [])

  const handleOpenLocation = useCallback((location: string) => {
    setData(prev => ({ ...prev, pickupLocation: location }))
  }, [])

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto py-10 px-5">
        <div className="py-1">
          <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-200  hover:bg-gray-400 text-gray-700" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-10 lg:p-12">
            
            <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
              Airport Pickup Form
            </h1>

            <ProgressBar step={3} totalSteps={4} />

            <div className="mt-12 mb-12">
              <StepThreeDetails
                availabilitySchedule={data.availabilitySchedule}
                pickupLocation={data.pickupLocation}
                onOpenSchedule={handleOpenSchedule}
                onOpenLocation={handleOpenLocation}
              />
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleContinue}
                disabled={isSubmitting}
                className="w-full max-w-sm bg-[#2d7a7a] hover:bg-[#246060] text-white py-6 text-base font-medium shadow-md transition-all active:scale-[0.98]"
                size="lg"
              >
                {isSubmitting ? "Processing..." : "Continue"}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
