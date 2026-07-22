"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import {
  Navigation,
  MapPin, Loader2, Clock, Users,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import {
  useGetDriverServiceRequestQuery,
  useUpdateTripStatusMutation,
} from "@/lib/api/riderApiSlice";

const RouteMap = dynamic(() => import("@/components/ui/route-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#e5e3df] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  ),
});

type TripStatus = "NAVIGATING_TO_PICKUP" | "ARRIVED_AT_PICKUP" | "ON_TRIP" | "COMPLETED";

const STATUS_LABELS: Record<TripStatus, string> = {
  NAVIGATING_TO_PICKUP: "Navigating to Pickup",
  ARRIVED_AT_PICKUP: "Arrived at Pickup",
  ON_TRIP: "On Trip",
  COMPLETED: "Trip Completed",
};

/**
 * Driver Action / Navigation Page
 *
 * Shows real rider details after the driver accepts a ride.
 * Progresses through: Navigate → Arrive → Start Trip → End Trip.
 */
export default function ActiveNavigation() {
  const router = useRouter();
  const [status, setStatus] = useState<TripStatus>("NAVIGATING_TO_PICKUP");

  // Read service request ID from sessionStorage (set when driver accepted the ride)
  const [serviceRequestId, setServiceRequestId] = useState<string>("");

  useEffect(() => {
    const id = sessionStorage.getItem("activeDriverServiceId") || "";
    setServiceRequestId(id);
  }, []);

  const { data: serviceRequest, isLoading: isLoadingRequest } =
    useGetDriverServiceRequestQuery(serviceRequestId, {
      skip: !serviceRequestId,
    });

  const [updateTripStatus, { isLoading: isUpdating }] = useUpdateTripStatusMutation();

  const rider = serviceRequest?.requester_name || "Passenger";
  const airport = serviceRequest?.airport_pickup_details?.airport || "Airport";
  const terminal = serviceRequest?.airport_pickup_details?.terminal || "";
  const pickupPoint = serviceRequest?.airport_pickup_details?.pickup_point || "";
  const destination = serviceRequest?.notes?.replace("Drop-off:", "").trim() || "Destination";
  const arrivalTime = serviceRequest?.airport_pickup_details?.arrival_datetime
    ? new Date(serviceRequest.airport_pickup_details.arrival_datetime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const passengers = serviceRequest?.airport_pickup_details?.num_passengers || 1;
  const bags = serviceRequest?.airport_pickup_details?.num_bags || 0;

  const pickupLat = serviceRequest?.pickup_latitude ? Number(serviceRequest.pickup_latitude) : null;
  const pickupLng = serviceRequest?.pickup_longitude ? Number(serviceRequest.pickup_longitude) : null;
  const dropoffLat = serviceRequest?.arrival_latitude ? Number(serviceRequest.arrival_latitude) : null;
  const dropoffLng = serviceRequest?.arrival_longitude ? Number(serviceRequest.arrival_longitude) : null;
  const price = serviceRequest?.price
    ? new Intl.NumberFormat("en", {
        style: "currency",
        currency: serviceRequest.currency || "NGN",
        minimumFractionDigits: 0,
      }).format(Number(serviceRequest.price))
    : "—";


  const pickupLabel = `${airport}${terminal ? ` — ${terminal}` : ""}${pickupPoint ? ` (${pickupPoint})` : ""}`;
  const currentLocation = status === "ON_TRIP" ? destination : pickupLabel;

  // Progress to next status and update backend
  const handleMainAction = async () => {
    if (isUpdating) return;

    const nextStatus: Record<TripStatus, TripStatus> = {
      NAVIGATING_TO_PICKUP: "ARRIVED_AT_PICKUP",
      ARRIVED_AT_PICKUP: "ON_TRIP",
      ON_TRIP: "COMPLETED",
      COMPLETED: "COMPLETED",
    };

    const next = nextStatus[status];

    // Map frontend status to backend trip status
    const backendStatusMap: Record<TripStatus, "en_route" | "arrived" | "picked_up" | "completed"> = {
      NAVIGATING_TO_PICKUP: "en_route",
      ARRIVED_AT_PICKUP: "arrived",
      ON_TRIP: "picked_up",
      COMPLETED: "completed",
    };

    if (serviceRequestId) {
      try {
        await updateTripStatus({
          serviceRequestId,
          payload: { status: backendStatusMap[next] },
        }).unwrap();
      } catch (err) {
        console.warn("Failed to update trip status on backend:", err);
      }
    }

    if (next === "COMPLETED") {
      toast.success("Trip completed! 🎉");
      router.push(`/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-trip-summary?id=${serviceRequestId}`);
      return;
    }

    setStatus(next);
    toast.success(STATUS_LABELS[next]);
  };

  // No active ride
  if (!serviceRequestId && !isLoadingRequest) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <MapPin className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500 font-medium">No active ride</p>
          <Button variant="outline" onClick={() => router.push("/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/available-jobs")}>
            Browse Available Rides
          </Button>
        </div>
      </DashboardShell>
    );
  }

  // Loading state
  if (isLoadingRequest) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          <p className="text-gray-500 font-medium">Loading trip details...</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex flex-col items-center w-full min-h-[calc(100vh-64px)] bg-gray-100 overflow-y-auto py-6 px-4 gap-4">
        {/* Top Banner */}
        <div className="w-full max-w-md bg-[#2d7a7a] text-white p-4 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-lg shrink-0">
            <Navigation className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] opacity-80 uppercase font-black tracking-widest leading-none mb-1">
              {status === "ON_TRIP" ? "Step 2: Drop-off" : "Step 1: Pickup"}
            </p>
            <h2 className="text-base font-bold truncate">{currentLocation}</h2>
          </div>
        </div>

        {/* Map with route */}
        <div className="w-full max-w-md h-[320px] rounded-2xl overflow-hidden shadow-lg">
          {pickupLat !== null && pickupLng !== null && dropoffLat !== null && dropoffLng !== null ? (
            <RouteMap
              pickupLat={pickupLat}
              pickupLng={pickupLng}
              pickupLabel={airport || "Pickup"}
              dropoffLat={dropoffLat}
              dropoffLng={dropoffLng}
              dropoffLabel={destination || "Drop-off"}
            />
          ) : (
            <div className="w-full h-full bg-[#e5e3df] flex items-center justify-center">
              <p className="text-gray-400 font-medium italic">
                Map unavailable — coordinates not set
              </p>
            </div>
          )}
        </div>

        {/* Bottom Card — Rider Info + Controls */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 border border-gray-100">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                status === "ON_TRIP" ? "bg-blue-400" : "bg-green-400"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                status === "ON_TRIP" ? "bg-blue-500" : "bg-green-500"
              )} />
            </span>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
              {STATUS_LABELS[status]}
            </span>
          </div>

          {/* Rider Details Card */}
          {serviceRequest && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                  <span className="text-teal-700 font-bold text-sm">
                    {rider.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{rider}</p>
                  <p className="text-xs text-gray-500">{serviceRequest.requester_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-teal-700">{price}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {pickupLabel}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  {destination}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {arrivalTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ETA {arrivalTime}
                  </span>
                )}
                {passengers > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {passengers} pax
                  </span>
                )}
                {bags > 0 && (
                  <span>{bags} bags</span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {status !== "ON_TRIP" && (
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-14 border-gray-200 text-gray-500 hover:bg-gray-50 font-bold"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            )}

            <Button
              onClick={handleMainAction}
              disabled={isUpdating}
              className={cn(
                "h-14 rounded-2xl font-black text-lg transition-all active:scale-95 flex-[2] shadow-lg",
                status === "ON_TRIP"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-black hover:bg-gray-900 text-white"
              )}
            >
              {isUpdating && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
              {status === "NAVIGATING_TO_PICKUP" && "I've Arrived"}
              {status === "ARRIVED_AT_PICKUP" && "Start Trip"}
              {status === "ON_TRIP" && "End Trip"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
