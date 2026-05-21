"use client";

import Image from "next/image";
import airport from "@/public/images/Airport.png";

export function StepFourNavigation() {
  return (
    <div className="space-y-6">
      <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
        <Image src={airport} alt="Map showing route to airport" className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
