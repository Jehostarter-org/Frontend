"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/contexts/currencyContext";
import { useGetServiceRequestQuery } from "@/lib/api/riderApiSlice";
import { ArrowLeft, MapPin, CheckCircle2, Wallet, Loader2 } from "lucide-react";

/**
 * Step 5 — Arrival / You have arrived.
 *
 * FIX: Reads the real price and currency from GET /api/services/<pk>/
 * instead of the hardcoded fallback. Currency is set per-country by the backend.
 */

interface StepFiveArrivalProps {
  onNext?: () => void;
  onBack?: () => void;
  serviceRequestId?: string;
}

export default function StepFiveArrival({ onNext }: StepFiveArrivalProps) {
  const router = useRouter();
  const { formatPrice: convertPrice } = useCurrency();

  function formatPrice(amount: string | null, currency: string): string {
    if (!amount) return "—";
    try {
      return convertPrice(Number(amount), currency || "AUD");
    } catch {
      return `${currency} ${amount}`;
    }
  }

  const resolvedId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("activeServiceRequestId") ?? ""
      : "";

  const { data: serviceRequest, isLoading } = useGetServiceRequestQuery(resolvedId, {
    skip: !resolvedId,
  });

  const handleContinue = () => {
    if (onNext) {
      onNext();
    } else {
      router.push(
        "/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/riders-rating"
      );
    }
  };

  // Extract destination from notes field ("Drop-off: <address>")
  const destination =
    serviceRequest?.notes?.replace("Drop-off:", "").trim() || "Your Destination";

  const priceDisplay = serviceRequest
    ? formatPrice(serviceRequest.price, serviceRequest.currency)
    : "—";

  return (
    <div className="max-w-5xl mx-auto py-10 px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="py-1">
        <Button
          variant="ghost"
          className="mb-6 md:-ml-60 bg-gray-200 hover:bg-gray-400 text-gray-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-100 group">
          <Image
            src="/images/Location.png"
            alt="Arrival Location"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full border border-white/50 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-teal-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">You have arrived!</h2>

              <p className="text-gray-500 mb-6 flex items-center justify-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {destination}
              </p>

              <div className="border-t border-gray-100 pt-4 mb-6">
                {isLoading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2">
                      <Wallet className="w-4 h-4" /> Final Fare
                    </span>
                    <span className="text-lg font-bold text-teal-900">{priceDisplay}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleContinue}
                className={cn(
                  "w-full py-6 text-lg font-semibold rounded-xl shadow-lg transition-transform active:scale-95",
                  "bg-teal-800 hover:bg-teal-900 text-white"
                )}
              >
                Rate Your Driver
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}