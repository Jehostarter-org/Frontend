"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/contexts/currencyContext";
import { useGetServiceRequestQuery } from "@/lib/api/riderApiSlice";
import { VehicleOption } from "./vehicle-stats";
import {
  ArrowLeft, Navigation, Clock, CreditCard,
  Users, Briefcase, ShieldCheck, Loader2,
} from "lucide-react";

const RouteMap = dynamic(() => import("@/components/ui/route-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
    </div>
  ),
});

/**
 * Step 3 — Direction / Confirm Booking summary screen.
 *
 * Now fetches the real booking from GET /api/services/<pk>/
 * using the serviceRequestId from sessionStorage (set in Step 1).
 * Shows the actual destination, airport, and selected vehicle.
 *
 * The selected vehicle info is read from sessionStorage (set in Step 2).
 */

interface StepThreeProps {
  onNext?: () => void;
  serviceRequestId?: string;
}

export default function StepThreeDirections({ onNext, serviceRequestId }: StepThreeProps) {
  const router = useRouter();

  // Resolve ID from prop or sessionStorage
  const resolvedId =
    serviceRequestId ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("activeServiceRequestId") ?? ""
      : "");

  const { data: serviceRequest, isLoading, isError } = useGetServiceRequestQuery(resolvedId, {
    skip: !resolvedId,
  });

  // Read selected vehicle from sessionStorage (set in vehicle-selection page)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("selectedVehicle");
      if (stored) {
        try {
          setSelectedVehicle(JSON.parse(stored));
        } catch { /* ignore parse errors */ }
      }
    }
  }, []);

  // Extract destination from notes field ("Drop-off: <address>")
  const destination = serviceRequest?.notes?.replace("Drop-off:", "").trim() || "Your Destination";

  // Pickup location from airport_pickup_details
  const pickupLocation = serviceRequest?.airport_pickup_details?.airport || "Airport";

  // Real coordinates for the map (set by the distance calculation step)
  const pickupLat = serviceRequest?.pickup_latitude ? Number(serviceRequest.pickup_latitude) : null;
  const pickupLng = serviceRequest?.pickup_longitude ? Number(serviceRequest.pickup_longitude) : null;
  const dropoffLat = serviceRequest?.arrival_latitude ? Number(serviceRequest.arrival_latitude) : null;
  const dropoffLng = serviceRequest?.arrival_longitude ? Number(serviceRequest.arrival_longitude) : null;
  const hasMapCoords = pickupLat !== null && pickupLng !== null && dropoffLat !== null && dropoffLng !== null;

  const { formatPrice: convertPrice } = useCurrency();

  // Build trip data from real API + session storage
  const price = selectedVehicle?.price ?? Number(serviceRequest?.price ?? 0);

  const formatCurrency = (amount: number) =>
    convertPrice(amount, serviceRequest?.currency || "NGN");

  const handleContinue = () => {
    if (onNext) {
      onNext();
    } else {
      router.push(
        "/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/drivers-arrival"
      );
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-20 flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
        <p className="text-gray-500 font-medium">Loading trip details…</p>
      </div>
    );
  }

  // ── Error / no ID ──────────────────────────────────────────────────────────
  if (isError || !resolvedId) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-20 text-center animate-in fade-in duration-500">
        <p className="text-red-500 font-bold text-lg">Could not load trip details.</p>
        <p className="text-gray-400 text-sm mt-1">Please go back and try booking again.</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => router.push("/dashboard/airport-pickup/riders-airport-pickup/riders-pickup")}
        >
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button
        variant="ghost"
        className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="space-y-8">
        {/* Vehicle preview */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-full md:w-3/5 h-48 md:h-64 flex items-center justify-center">
              <Image
                src="/images/lexus.png"
                alt={selectedVehicle?.name || "Vehicle"}
                width={500}
                height={300}
                className="object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-500"
              />
            </div>
            <div className="w-full md:w-2/5 space-y-4 text-center md:text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Selected Ride
                </span>
                <h2 className="text-3xl font-black text-gray-900 mt-2">
                  {selectedVehicle?.name || "Vehicle"}
                </h2>
                <p className="text-gray-500 font-medium">
                  {selectedVehicle?.description || ""}
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <Users className="w-4 h-4" /> {selectedVehicle?.capacity || "—"}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <Briefcase className="w-4 h-4" /> {selectedVehicle?.luggage || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Route */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-teal-600" /> Route Info
            </h3>
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full border-4 border-white bg-teal-500 shadow-sm" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</p>
                <p className="font-bold text-gray-800 line-clamp-1">{pickupLocation}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full border-4 border-white bg-gray-900 shadow-sm" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To</p>
                <p className="font-bold text-gray-800 line-clamp-1">{destination}</p>
              </div>
            </div>
          </div>

          {/* Fare + confirm */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Fare</p>
                  <p className="text-3xl font-black text-gray-900">{formatCurrency(price)}</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">
                    {serviceRequest?.airport_pickup_details?.arrival_datetime
                      ? new Date(serviceRequest.airport_pickup_details.arrival_datetime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Scheduled"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-700">Insured Trip</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleContinue}
              className="w-full mt-6 py-7 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-lg font-bold shadow-lg shadow-teal-900/10"
            >
              Confirm — Finding Your Driver
            </Button>
          </div>
        </div>

        {/* Route map preview — Uber-style road directions */}
        <div className="relative w-full h-48 rounded-3xl overflow-hidden border border-gray-100">
          {hasMapCoords ? (
            <RouteMap
              pickupLat={pickupLat!}
              pickupLng={pickupLng!}
              pickupLabel={pickupLocation}
              dropoffLat={dropoffLat!}
              dropoffLng={dropoffLng!}
              dropoffLabel={destination}
            />
          ) : (
            <div className="relative w-full h-full">
              <Image src="/images/Location.png" alt="Map" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
