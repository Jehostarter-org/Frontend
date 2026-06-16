"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SelectionCard } from "@/components/reuseables/cardSelection"
import DashboardShell from "@/components/dashboard/dashboard-layout"
import { useState } from "react"

type ChaperoneOption = "register" | "book"

export default function ChaperonePage() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<ChaperoneOption>("register")

  const handleContinue = () => {
    if (selectedOption === "register") {
      router.push("/dashboard/chaperone/chaperone-registration")
    } else {
      router.push("/dashboard/chaperone/book-chaperone")
    }
  }

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto p-5 mb-10">
        <div className="py-1">
          <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-200 hover:bg-gray-400 text-gray-700" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12">
          <h1 className="text-3xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
            Chaperone Services
          </h1>

          <div className="mt-12 mb-12">
            <h2 className="text-2xl font-semibold text-center mb-2 text-gray-900">
              What would you like to do?
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Choose an option to get started
            </p>
            <div className="space-y-4 max-w-xl mx-auto" role="radiogroup" aria-label="Chaperone Option Selection">
              <SelectionCard
                id="register"
                title="Register as a Chaperone"
                description="Offer chaperone services to help immigrants with registrations, tax filings, and translations"
                isSelected={selectedOption === "register"}
                onClick={() => setSelectedOption("register")}
              />

              <SelectionCard
                id="book"
                title="Book Chaperone Services"
                description="Request a chaperone to assist you with registrations, paperwork, and translation services"
                isSelected={selectedOption === "book"}
                onClick={() => setSelectedOption("book")}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button onClick={handleContinue} size="lg"
              className="w-full max-w-sm bg-[#2d4a53] hover:bg-[#243a42] text-white py-6 text-base font-medium shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
