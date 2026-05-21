"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, DollarSign, MapPin, Clock } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";

export default function TripCompletion() {
  const router = useRouter();
  const [rating, setRating] = useState(0);

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto p-5 py-10">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden text-center">
          
          {/* Success Header */}
          <div className="bg-[#f0f9f9] py-12 flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle2 className="h-16 w-16 text-[#2d7a7a]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Completed!</h1>
            <p className="text-gray-500 mt-2 text-lg">Great job, your fare is being processed.</p>
          </div>

          <div className="p-8">
            {/* Earnings Summary */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex justify-around items-center">
              <div className="text-center">
                <p className="text-sm text-gray-500 uppercase font-semibold">Total Fare</p>
                <div className="text-2xl font-bold text-gray-900 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" /> 45.50
                </div>
              </div>
              <div className="h-10 w-[1px] bg-gray-200" />
              <div className="text-center">
                <p className="text-sm text-gray-500 uppercase font-semibold">Distance</p>
                <p className="text-2xl font-bold text-gray-900">12.4 km</p>
              </div>
              <div className="h-10 w-[1px] bg-gray-200" />
              <div className="text-center">
                <p className="text-sm text-gray-500 uppercase font-semibold">Duration</p>
                <p className="text-2xl font-bold text-gray-900">28 min</p>
              </div>
            </div>

            {/* Rating Section */}
            <div className="mb-10">
              <h3 className="font-semibold text-gray-800 mb-4">Rate the Passenger</h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform active:scale-90"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Final Actions */}
            <div className="space-y-3">
              <Button 
                onClick={() => router.push("/dashboard/airport-pickup/drivers-pickup")}
                className="w-full bg-[#2d7a7a] hover:bg-[#246060] text-white py-7 text-lg font-bold rounded-2xl shadow-lg"
              >
                Go Back Online
              </Button>
              <Button 
                variant="ghost" 
                className="w-full text-gray-500 hover:text-gray-700"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard Home
              </Button>
            </div>
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}