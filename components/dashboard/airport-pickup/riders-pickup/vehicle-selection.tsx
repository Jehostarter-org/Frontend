"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowLeft, Car, Info, Loader2, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";import { useGetServiceRequestQuery,
  useConfirmVehicleMutation,
  useGetVehicleTypesQuery,
} from "@/lib/api/riderApiSlice";

/**
 * Step 2 — Vehicle selection.
 * 
 * Single vehicle type only - no premium/van/bus options.
 * The price is fetched from the backend service request (calculated based on distance).
 * Frontend NEVER calculates prices - only displays what backend returns.
 */

interface StepTwoProps {
  onNext?: () => void;
  onBack?: () => void;
}

export default function StepTwoVehicleSelection({ onNext, onBack }: StepTwoProps) {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [backendPrice, setBackendPrice] = useState<number | null>(null);
  const [backendCurrency, setBackendCurrency] = useState<string>("NGN");
  const [distanceInfo, setDistanceInfo] = useState<{
    distance_km: number;
    duration_min: number;
  } | null>(null);

  // Get the service request ID from session storage
  const serviceRequestId = typeof window !== "undefined"
    ? sessionStorage.getItem("activeServiceRequestId") ?? ""
    : "";

  console.log("Service Request ID from session:", serviceRequestId);

  // Fetch the service request details to get the backend-calculated price
  const {
    data: serviceRequest,
    isLoading: isLoadingRequest,
    error: requestError,
    refetch
  } = useGetServiceRequestQuery(
    serviceRequestId,
    { skip: !serviceRequestId }
  );

  const [confirmVehicle, { isLoading: isConfirming }] = useConfirmVehicleMutation();
  const { data: vehicleTypes } = useGetVehicleTypesQuery();

  // Extract price and distance information from the service request (BACKEND AUTHORITATIVE)
  useEffect(() => {
    if (serviceRequest) {
      console.log("Service request data:", serviceRequest);

      // These values come DIRECTLY from the backend - NO frontend calculation
      let price = serviceRequest.price ? parseFloat(serviceRequest.price) : 0;
      let currency = serviceRequest.currency || "NGN";
      let distanceKm = serviceRequest.distance_km || 0;
      let durationMin = serviceRequest.estimated_duration_min || 0;

      // ── Fallback: use distance/price calculated in Step 1 ───────────
      // When the service request is freshly created, price & distance may
      // still be null. Step 1 (riders-pickup-form) awaits a distance
      // calculation and stashes the results in sessionStorage before
      // navigating here.
      if (!price && typeof window !== "undefined") {
        const storedPrice = sessionStorage.getItem("calculatedPrice");
        const storedCurrency = sessionStorage.getItem("calculatedCurrency");
        const storedDistance = sessionStorage.getItem("tripDistance");
        const storedDuration = sessionStorage.getItem("tripDuration");

        if (storedPrice) {
          price = parseFloat(storedPrice);
          currency = storedCurrency || currency;
          console.log("Using Step-1 calculated price:", price, currency);
        }
        if (storedDistance) distanceKm = parseFloat(storedDistance) || distanceKm;
        if (storedDuration) durationMin = parseFloat(storedDuration) || durationMin;
      }

      // ── Last resort: use base vehicle price if still zero ──────────
      // Prevents the Confirm button from being permanently disabled
      // when distance calculation failed upstream.
      if (!price || price <= 0) {
        const regularVehicle = vehicleTypes?.find((v) => v.id === "regular");
        price = regularVehicle?.price || 0;
        currency = serviceRequest?.currency || currency;
        console.log("Using base vehicle fallback price:", price, currency);
      }
      // ─────────────────────────────────────────────────────────────────

      console.log("Backend-calculated values:", {
        price,
        currency,
        distanceKm,
        durationMin,
        calculationMethod: serviceRequest.distance_calculation_method,
        multiplier: serviceRequest.distance_price_multiplier,
        originalBasePrice: serviceRequest.original_base_price,
      });

      setBackendPrice(price);
      setBackendCurrency(currency);
      setDistanceInfo({
        distance_km: distanceKm,
        duration_min: durationMin,
      });

      // Store in session storage for the next step
      sessionStorage.setItem("confirmedPrice", price.toString());
      sessionStorage.setItem("confirmedCurrency", currency);
      sessionStorage.setItem("tripDistance", distanceKm.toString());
      sessionStorage.setItem("tripDuration", durationMin.toString());
    }
  }, [serviceRequest, vehicleTypes]);

  const handleConfirm = async () => {
    if (!serviceRequestId) {
      toast.error("Service request not found. Please go back and try again.");
      return;
    }

    if (!backendPrice) {
      toast.error("Price not available. Please wait or try again.");
      return;
    }

    try {
      // Call backend to confirm vehicle - backend returns the authoritative price
      const result = await confirmVehicle({
        serviceRequestId,
        vehicle_type: "regular", // Single vehicle type
      }).unwrap();

      console.log("Backend confirmation response:", result);

      // Use the price returned from the confirmation endpoint
      const confirmedPrice = parseFloat(result.price);
      setBackendPrice(confirmedPrice);

      toast.success(`Trip confirmed - ${formatCurrency(confirmedPrice)}`);

      setIsConfirmed(true);

      // Short delay to show success state, then continue
      setTimeout(() => {
        if (onNext) {
          onNext();
        } else {
          router.push(
            "/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/direction"
          );
        }
      }, 1000);

    } catch (err: any) {
      console.error("confirm-vehicle failed:", err);

      // Extract error message from backend response
      let errorMsg = "Could not confirm booking. Please try again.";
      if (err?.data?.detail) {
        errorMsg = err.data.detail;
      } else if (err?.data?.message) {
        errorMsg = err.data.message;
      } else if (typeof err?.data === 'string') {
        errorMsg = err.data;
      }

      toast.error(errorMsg);
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return "—";
    try {
      return new Intl.NumberFormat("en", {
        style: "currency",
        currency: backendCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${backendCurrency} ${amount.toFixed(0)}`;
    }
  };

  const isLoading = isLoadingRequest;

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-5">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-teal-600" />
          <p className="text-sm font-bold text-gray-400">Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Show error state if request fails
  if (requestError && !isLoading) {
    console.error("Request error:", requestError);
    return (
      <div className="max-w-3xl mx-auto py-10 px-5">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Info className="h-12 w-12 text-red-500" />
          <p className="text-red-800 font-bold text-lg">Failed to load trip details</p>
          <p className="text-gray-500 text-sm">Could not retrieve pricing information.</p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="mt-4"
          >
            Try Again
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-100">
          <div className="w-2 h-2 rounded-full bg-teal-300" />
          <div className="w-6 h-2 rounded-full bg-teal-600" />
          <div className="w-2 h-2 rounded-full bg-teal-300" />
          <span className="text-xs font-bold text-teal-800 ml-2 uppercase tracking-wider">
            Step 2 of 3
          </span>
        </div>
      </div>

      {/* Distance Info Banner */}
      {distanceInfo && distanceInfo.distance_km > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-teal-600 font-bold uppercase tracking-wider">
                  Trip Distance
                </p>
                <p className="text-xl font-black text-gray-900">
                  {distanceInfo.distance_km.toFixed(1)} km
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                  Est. Duration
                </p>
                <p className="text-xl font-black text-gray-900">
                  {Math.round(distanceInfo.duration_min)} min
                </p>
              </div>
            </div>
            {serviceRequest?.distance_calculation_method && (
              <div className="px-2 py-1 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-500">
                  Calculated via {serviceRequest.distance_calculation_method}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Confirm Your Ride
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            Review your trip details and confirm the fare
          </p>
        </div>

        <div className="space-y-6">
          {/* Single Vehicle Card - Shows BACKEND PRICE only */}
          <div className={cn(
            "relative rounded-2xl border-2 transition-all duration-200 overflow-hidden",
            "bg-gradient-to-br from-teal-50/50 to-white",
            "border-teal-500 shadow-lg shadow-teal-100",
            isConfirmed && "border-green-500 bg-green-50/30"
          )}>
            {isConfirmed && (
              <div className="absolute top-4 right-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Confirmed
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-1 bg-teal-100 rounded-full">
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                        Standard Car
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900">Airport Transfer</h3>
                  <p className="text-gray-500 mt-1">
                    Comfortable sedan with professional driver
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">👥</span> Up to 4 passengers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">🧳</span> 3 suitcases
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">❄️</span> Air conditioned
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">📶</span> Free Wi-Fi
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-full bg-teal-100">
                  <Car className="w-8 h-8 text-teal-600" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-teal-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      Total Fare (from backend)
                    </p>
                    {serviceRequest?.original_base_price && (
                      <p className="text-xs text-teal-600 mt-0.5">
                        Includes distance-based adjustment
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {backendPrice ? (
                      <>
                        <p className="text-3xl font-black text-teal-600">
                          {formatCurrency(backendPrice)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {backendCurrency} · No hidden fees
                        </p>
                      </>
                    ) : (
                      <Loader2 className="animate-spin h-6 w-6 text-teal-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown - Display only, NO calculation */}
          {serviceRequest && serviceRequest.original_base_price && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" /> Price Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base fare</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(serviceRequest.original_base_price))}
                  </span>
                </div>
                {serviceRequest.distance_price_multiplier && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Distance multiplier</span>
                    <span className="font-medium">
                      {(serviceRequest.distance_price_multiplier * 100 - 100).toFixed(0)}%
                    </span>
                  </div>
                )}
                {serviceRequest.distance_km && serviceRequest.distance_km > 50 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Long distance surcharge (15%)</span>
                    <span className="font-medium">Included in total</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold">
                  <span>Total (authoritative from backend)</span>
                  <span className="text-teal-600 text-lg">
                    {backendPrice ? formatCurrency(backendPrice) : "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <p className="text-sm text-gray-400 font-medium text-center md:text-left">
            All prices are calculated server-side and are final.
            {serviceRequest?.distance_calculation_method === 'straight_line' &&
              " Distance is estimated (straight-line calculation)."
            }
          </p>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 md:flex-none px-8 py-6"
              disabled={isConfirming}
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!backendPrice || isLoading || isConfirming || isConfirmed}
              className={cn(
                "flex-1 md:flex-none md:min-w-[200px] py-6 text-lg font-black rounded-xl transition-all shadow-xl",
                "bg-teal-700 hover:bg-teal-800 text-white shadow-teal-900/10 active:scale-[0.98]",
                "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
              )}
            >
              {isConfirming ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Confirming...
                </span>
              ) : isConfirmed ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Confirmed!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Confirm & Continue
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}