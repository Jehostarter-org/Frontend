"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import DashboardShell from "@/components/dashboard/dashboard-layout"
import { StepTwoRegistration } from "@/components/dashboard/airport-pickup/drivers-pickup/driver-pickup-registration"
import { INITIAL_DATA } from "@/components/dashboard/airport-pickup/drivers-pickup/driver-pickup-form-stats"

export default function DriverPickupRegistration() {
  const router = useRouter()
  const [data, setData] = useState(INITIAL_DATA)

  const handleUpdate = (field: keyof typeof INITIAL_DATA, value: string | File | null) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {

  }

  const handleBack = () => {
    router.push("/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-details")
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl p-5 mx-auto py-15">
        <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-100 hover:bg-gray-300 text-gray-700" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12">
          <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
            Airport Pickup Form
          </h1>
          <div className="mb-6 max-w-md mx-auto">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-[#2d7a7a] h-full rounded-full transition-all duration-300 ease-out" style={{ width: "50%" }} />
            </div>
            {/* <p className="text-center text-sm text-gray-500 mt-3">Step 2 of 4</p> */}
          </div>

          <StepTwoRegistration data={data} onUpdate={handleUpdate} />

          <div className="flex justify-center mt-8">
            <Button onClick={handleContinue}
              className="w-full max-w-sm bg-[#2d7a7a] hover:bg-[#246060] text-white py-6 text-base font-medium shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
