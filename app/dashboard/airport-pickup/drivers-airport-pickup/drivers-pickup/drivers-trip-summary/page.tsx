"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, DollarSign, MapPin, Clock, Loader2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useGetDriverServiceRequestQuery, useRatePassengerMutation } from "@/lib/api/riderApiSlice";

export default function TripCompletion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rating, setRating] = useState(0);
  const [serviceRequestId, setServiceRequestId] = useState("");

  useEffect(() => {
    const id = searchParams.get("id") || sessionStorage.getItem("activeDriverServiceId") || "";
    setServiceRequestId(id);
  }, [searchParams]);

  const { data: sr, isLoading } = useGetDriverServiceRequestQuery(serviceRequestId, {
    skip: !serviceRequestId,
  });

  const [ratePassenger, { isLoading: isSubmitting }] = useRatePassengerMutation();

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error("Please rate the passenger");
      return;
    }
    try {
      await ratePassenger({ serviceId: serviceRequestId, rating }).unwrap();
      toast.success("Rating submitted!");
    } catch {
      toast.error("Failed to submit rating");
    }
  };

  const price = sr?.price
    ? new Intl.NumberFormat("en", {
        style: "currency",
        currency: sr.currency || "NGN",
        minimumFractionDigits: 0,
      }).format(Number(sr.price))
    : "—";

  const distance = sr?.distance_km ? `${Number(sr.distance_km).toFixed(1)} km` : "—";
  const duration = sr?.estimated_duration_min ? `${sr.estimated_duration_min} min` : "—";

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </DashboardShell>
    );
  }

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
                  <DollarSign className="h-5 w-5" /> {price}
                </div>
              </div>
              <div className="h-10 w-[1px] bg-gray-200" />
              <div className="text-center">
                <p className="text-sm text-gray-500 uppercase font-semibold">Distance</p>
                <p className="text-2xl font-bold text-gray-900">{distance}</p>
              </div>
              <div className="h-10 w-[1px] bg-gray-200" />
              <div className="text-center">
                <p className="text-sm text-gray-500 uppercase font-semibold">Duration</p>
                <p className="text-2xl font-bold text-gray-900">{duration}</p>
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
              <Button
                onClick={handleSubmitRating}
                disabled={isSubmitting || rating === 0}
                className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl"
              >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>

            {/* Final Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  sessionStorage.removeItem("activeDriverServiceId");
                  router.push("/dashboard");
                }}
                className="w-full bg-[#2d7a7a] hover:bg-[#246060] text-white py-7 text-lg font-bold rounded-2xl shadow-lg"
              >
                Go Back Online
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700"
                onClick={() => {
                  sessionStorage.removeItem("activeDriverServiceId");
                  router.push("/dashboard");
                }}
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
