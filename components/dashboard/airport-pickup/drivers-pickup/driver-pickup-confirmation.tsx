"use client"

import type { ServiceRequest } from "@/lib/api/riderApiSlice";

/**
 * Step Five — Driver sees the rider's pickup details.
 *
 * Accepts either:
 *  - A full ServiceRequest object (from the API), or
 *  - Legacy ConfirmationData for backward compatibility.
 */

interface LegacyConfirmationData {
  rideId: string
  passengerName: string
  contactNumber: string
  pickupLocationFinal: string
  dropoffLocation: string
  estimatedArrival: string
}

interface StepFiveProps {
  /** Real API service request — preferred */
  serviceRequest?: ServiceRequest | null
  /** Legacy hardcoded data — fallback */
  data?: LegacyConfirmationData
}

export function StepFiveConfirmation({ serviceRequest, data }: StepFiveProps) {
  // If we have a real service request, derive values from it
  const rideId = serviceRequest?.id || data?.rideId || "—"
  const passengerName = serviceRequest?.requester_name || data?.passengerName || "Passenger"
  const contactNumber = data?.contactNumber || "Via app messaging"
  const pickupLocation = serviceRequest?.airport_pickup_details?.airport || data?.pickupLocationFinal || "—"
  const terminal = serviceRequest?.airport_pickup_details?.terminal || ""
  const pickupPoint = serviceRequest?.airport_pickup_details?.pickup_point || ""
  const dropoffLocation = serviceRequest?.notes?.replace("Drop-off:", "").trim() || data?.dropoffLocation || "—"
  const arrivalTime = serviceRequest?.airport_pickup_details?.arrival_datetime
    ? new Date(serviceRequest.airport_pickup_details.arrival_datetime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : data?.estimatedArrival || "—"
  const passengers = serviceRequest?.airport_pickup_details?.num_passengers || 1
  const bags = serviceRequest?.airport_pickup_details?.num_bags || 0
  const flightNumber = serviceRequest?.airport_pickup_details?.flight_number || ""

  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-8">Rider&apos;s Information</h2>

      <div className="bg-white border border-gray-300 rounded-xl p-6 space-y-4">
        <Row label="Ride ID" value={rideId} />
        <Row label="Passenger" value={passengerName} />
        <Row label="Contact" value={contactNumber} />
        <Row
          label="Pickup Location"
          value={`${pickupLocation}${terminal ? ` — ${terminal}` : ""}${pickupPoint ? ` (${pickupPoint})` : ""}`}
          right
        />
        <Row label="Drop-off Location" value={dropoffLocation} right />
        <Row label="Arrival Time" value={arrivalTime} />
        {flightNumber && <Row label="Flight" value={flightNumber} />}
        <Row label="Passengers" value={String(passengers)} />
        {bags > 0 && <Row label="Bags" value={String(bags)} />}
      </div>
    </>
  )
}

function Row({ label, value, right }: { label: string; value: string; right?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0">
      <span className="font-medium text-gray-700">{label}</span>
      <span className={`font-semibold ${right ? "text-right max-w-[60%]" : ""}`}>{value}</span>
    </div>
  )
}
