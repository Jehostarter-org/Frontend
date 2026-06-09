"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SelectionCard } from "@/components/reuseables/cardSelection";

type UserRole = "driver" | "rider";

export default function AirportPickupForm() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<UserRole>("driver");

  const handleContinue = () => {
    if (selectedOption === "driver") {
      router.push("/dashboard/airport-pickup/drivers-airport-pickup/drivers-registration");
    } else {
      router.push("/dashboard/airport-pickup/riders-airport-pickup/riders-pickup");
    }
  };

  return (
   <div className="max-w-5xl mx-auto p-5 mb-10">
    <div className="py-1">
      <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-200  hover:bg-gray-400 text-gray-700" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
    </div>

      <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12">
        <h1 className="text-3xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
          Airport Pickup Form
        </h1>
        <div className="mb-6 max-w-md mx-auto">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#2d7a7a] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: "25%" }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">Step 1 of 4</p>
        </div>

        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-semibold text-center mb-2 text-gray-900">
            Choose your purpose
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Select the form you need
          </p>
          <div className="space-y-4 max-w-xl mx-auto" role="radiogroup" aria-label="User Role Selection">
            <SelectionCard
              id="driver"
              title="Select Driver's Option"
              description="Provide services and get paid by picking immigrants from the airport"
              isSelected={selectedOption === "driver"}
              onClick={() => setSelectedOption("driver")}
            />

            <SelectionCard
              id="rider"
              title="Select Rider's Option"
              description="Request a ride and get picked up safely from the airport to your destination"
              isSelected={selectedOption === "rider"}
              onClick={() => setSelectedOption("rider")}
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
  );
}
