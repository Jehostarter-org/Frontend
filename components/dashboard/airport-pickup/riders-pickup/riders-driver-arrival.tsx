"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGetServiceRequestQuery } from "@/lib/api/riderApiSlice";
import {
  ArrowLeft, Phone, MessageSquare, Star, CarFront, MapPin, Loader2,
} from "lucide-react";

/**
 * Step 4 — Driver has arrived.
 *
 * FIX: Polls GET /api/services/<serviceRequestId>/ every 10 seconds.
 * Once the service request has status "accepted", driver_details is populated
 * by the backend (set in ServiceRequestSerializer.get_driver_details).
 * We show the real driver name, photo, vehicle, plate, rating and trip count.
 */

interface StepFourProps {
  onNext?: () => void;
  onBack?: () => void;
  serviceRequestId?: string; // passed from the wizard; falls back to sessionStorage
}

export default function StepFourDriverArrived({ onNext, serviceRequestId }: StepFourProps) {
  const router = useRouter();

  // Resolve ID from prop or sessionStorage (fallback when navigating directly)
  const resolvedId =
    serviceRequestId ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("activeServiceRequestId") ?? ""
      : "");

  const { data: serviceRequest, isLoading, isError } = useGetServiceRequestQuery(resolvedId, {
    skip: !resolvedId,
    pollingInterval: 10_000, // re-fetch every 10s until driver claims the job
  });

  const driver = serviceRequest?.driver_details;

  const handleContinue = () => {
    if (onNext) {
      onNext();
    } else {
      router.push(
        "/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/riders-destination"
      );
    }
  };

  const handleCall = () => {
    // Phone number is not exposed in driver_details for privacy — 
    // open in-app message instead, or extend the serializer to include it.
    alert("Use the Message button to contact your driver through the app.");
  };

  // ── Loading / waiting for driver ─────────────────────────────────────────
  if (isLoading || !driver) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-20 flex flex-col items-center gap-6 animate-in fade-in duration-500">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Looking for your driver…</h2>
          <p className="text-gray-500 mt-1 animate-pulse">
            <MapPin className="w-4 h-4 inline mr-1" />
            We'll notify you once a driver accepts your request
          </p>
        </div>
        {isError && (
          <p className="text-sm text-red-500">
            Could not load request details. Please refresh the page.
          </p>
        )}
      </div>
    );
  }

  // ── Driver assigned ───────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Button
          variant="ghost"
          className="md:-ml-60 bg-gray-200 hover:bg-gray-400 text-gray-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your Driver has Arrived</h2>
          <p className="text-teal-700 font-medium animate-pulse mt-1">
            <MapPin className="w-4 h-4 inline mr-1" />
            Waiting at Pickup Point
          </p>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
          <div className="relative w-full h-48 md:h-64 bg-gray-100">
            {driver.front_view_picture ? (
              <Image
                src={driver.front_view_picture}
                alt="Driver's vehicle"
                fill
                className="object-cover opacity-80"
              />
            ) : (
              <Image
                src="/images/Airport.png"
                alt="Location Map"
                fill
                className="object-cover opacity-80"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          <div className="relative -mt-16 px-6 pb-8">
            {/* Driver avatar */}
            <div className="relative w-32 h-32 mx-auto rounded-full p-1 bg-white shadow-xl">
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-teal-50">
                <Image
                  src={driver.profile_photo || "/images/big logo BLACK.png"}
                  alt={driver.full_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-white px-2 py-1 rounded-full shadow-md flex items-center gap-1 border border-gray-100">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-gray-800">
                  {Number(driver.rating).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="text-center mt-4 space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">{driver.full_name}</h3>
              <p className="text-sm text-gray-500">{driver.total_trips} trips completed</p>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <div className="bg-gray-50 px-5 py-3 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <CarFront className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Vehicle</p>
                  <p className="font-bold text-gray-900">{driver.vehicle_model}</p>
                  <p className="text-xs text-gray-400">{driver.vehicle_colour}</p>
                </div>
              </div>

              <div className="bg-teal-50 px-5 py-3 rounded-xl border border-teal-100 flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <span className="text-xs font-bold text-teal-800">LND</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-teal-600 font-medium uppercase tracking-wider">Plate No</p>
                  <p className="font-bold text-teal-900">{driver.license_plate_number}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 max-w-sm mx-auto">
              <Button
                variant="outline"
                onClick={handleCall}
                className="h-12 border-gray-300 hover:bg-gray-50 hover:text-teal-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Driver
              </Button>
              <Button
                variant="outline"
                className="h-12 border-gray-300 hover:bg-gray-50 hover:text-teal-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-center">
          <Button
            onClick={handleContinue}
            className={cn(
              "w-full md:max-w-md py-7 text-lg font-semibold rounded-xl shadow-lg transition-transform active:scale-[0.99]",
              "bg-teal-800 hover:bg-teal-900 text-white"
            )}
          >
            I have met the driver
          </Button>
        </div>
      </div>
    </div>
  );
}