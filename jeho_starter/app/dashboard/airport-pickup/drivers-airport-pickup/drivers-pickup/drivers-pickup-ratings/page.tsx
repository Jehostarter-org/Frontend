"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { INITIAL_DATA } from "@/components/dashboard/airport-pickup/drivers-pickup/driver-pickup-form-stats";
import { StepSixRating } from "@/components/dashboard/airport-pickup/drivers-pickup/driver-pickup-ratings";

export default function DriverPickupRatings() {
  const router = useRouter()
  const [data, setData] = useState(INITIAL_DATA)

  const handleUpdate = (field: keyof typeof INITIAL_DATA, value: string | File | null | number) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    router.push("/dashboard")
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl py-10 md:mt-20 px-2 mx-auto">
        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm py-10 lg:p-12">
          <StepSixRating
            rating={data.rating}
            feedback={data.feedback}
            onRatingChange={(rating) => handleUpdate("rating", rating)}
            onFeedbackChange={(feedback) => handleUpdate("feedback", feedback)}
          />

          <div className="flex justify-center mt-8">
            <Button onClick={handleSubmit}
              className="w-full max-w-sm bg-[#2d7a7a] hover:bg-[#246060] text-white py-6 text-base font-medium shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              size="lg"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
