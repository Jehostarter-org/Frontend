"use client"

import { Clock } from "lucide-react";
import { useCurrency } from "@/components/contexts/currencyContext";
import type { ServiceRequest } from "@/lib/api/riderApiSlice";

/**
 * Step Five — Driver sees the rider's full pickup details before accepting.
 *
 * Field mapping (from ServiceRequest model):
 *
 *  PICKUP (where the driver goes to collect the rider)
 *    → pickup_address           e.g. "14 Marina Road, Lagos"
 *
 *  DROP-OFF / DESTINATION (the airport)
 *    → airport_pickup_details.airport   e.g. "Murtala Muhammed International Airport"
 *    → airport_pickup_details.terminal  e.g. "Terminal 1"
 *    → airport_pickup_details.pickup_point e.g. "Departures Gate B"
 *    → arrival_address          full airport address string (fallback)
 *
 *  The rider's "destination" note (description/notes) may also describe
 *  where they are going after the airport but for pickup jobs the
 *  driver needs pickup_address → airport.
 */

interface StepFiveProps {
  /** Real API service request — preferred */
  serviceRequest?: ServiceRequest | null;
}

export function StepFiveConfirmation({ serviceRequest }: StepFiveProps) {
  const sr = serviceRequest;
  const { formatPrice: convertPrice } = useCurrency();

  // ── Identity ────────────────────────────────────────────────────────────────
  const rideId       = sr?.id          ?? "—";
  const passengerName = sr?.requester_name ?? "Passenger";

  // ── Pickup location (where driver collects rider) ───────────────────────────
  // pickup_address is saved by the rider during the booking flow (update-distance step)
  const pickupAddress = sr?.pickup_address?.trim() || null;

  // ── Airport / drop-off ──────────────────────────────────────────────────────
  const airport     = sr?.airport_pickup_details?.airport    ?? "";
  const terminal    = sr?.airport_pickup_details?.terminal   ?? "";
  const pickupPoint = sr?.airport_pickup_details?.pickup_point ?? "";
  // Build a human-readable airport string
  const airportLabel = [airport, terminal, pickupPoint].filter(Boolean).join(" — ");
  const airportFallback = sr?.arrival_address?.trim() || "—";
  const dropoffLabel = airportLabel || airportFallback;

  // ── Flight & timing ─────────────────────────────────────────────────────────
  const arrivalDatetime = sr?.airport_pickup_details?.arrival_datetime;
  const arrivalTime = arrivalDatetime
    ? new Date(arrivalDatetime).toLocaleString("en-US", {
        weekday: "short",
        month:   "short",
        day:     "numeric",
        hour:    "2-digit",
        minute:  "2-digit",
      })
    : "—";

  const flightNumber    = sr?.airport_pickup_details?.flight_number ?? "";
  const numPassengers   = sr?.airport_pickup_details?.num_passengers ?? 1;
  const numBags         = sr?.airport_pickup_details?.num_bags ?? 0;
  const specialRequests = sr?.airport_pickup_details?.special_requests ?? "";

  // ── Price ───────────────────────────────────────────────────────────────────
  const price    = sr?.price    ?? null;
  const currency = sr?.currency ?? "";
  const formattedPrice = price
    ? (() => {
        try {
          return convertPrice(Number(price), currency || "AUD");
        } catch {
          return `${currency} ${price}`;
        }
      })()
    : "—";

  // ── Distance ────────────────────────────────────────────────────────────────
  const distanceKm = sr?.distance_km ? `${Number(sr.distance_km).toFixed(1)} km` : null;
  const durationMin = sr?.estimated_duration_min
    ? `~${sr.estimated_duration_min} min drive`
    : null;

  // ── Arrival date vs time split ────────────────────────────────────────────
  const arrivalDateOnly = arrivalDatetime
    ? new Date(arrivalDatetime).toLocaleDateString("en-US", {
        weekday: "long",
        year:    "numeric",
        month:   "long",
        day:     "numeric",
      })
    : null;

  const arrivalTimeOnly = arrivalDatetime
    ? new Date(arrivalDatetime).toLocaleTimeString("en-US", {
        hour:   "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-8">Rider&apos;s Information</h2>

      {/* ── Flight Arrival Time Card ── */}
      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-600">Flight Arrival Time</p>
        </div>
        {arrivalDatetime ? (
          <div className="pl-1">
            <p className="text-3xl font-black text-blue-700 leading-none">{arrivalTimeOnly}</p>
            <p className="text-sm text-blue-500 mt-1 font-medium">{arrivalDateOnly}</p>
          </div>
        ) : (
          <p className="text-amber-600 italic text-sm pl-1">Arrival time not set</p>
        )}
      </div>

      {/* Pickup → Drop-off visual route */}
      <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/40 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 w-3 h-3 rounded-full bg-teal-500 flex-shrink-0 ring-4 ring-teal-100" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-0.5">Pickup</p>
            <p className="font-semibold text-gray-900 text-sm">
              {pickupAddress ?? <span className="text-amber-600 italic">Address not provided yet</span>}
            </p>
          </div>
        </div>

        {(distanceKm || durationMin) && (
          <div className="flex items-center gap-2 pl-6">
            <div className="w-0.5 h-6 bg-teal-200 mx-0.5" />
            <p className="text-xs text-slate-400 font-medium">
              {[distanceKm, durationMin].filter(Boolean).join("  ·  ")}
            </p>
          </div>
        )}

        <div className="flex items-start gap-3">
          <span className="mt-1 w-3 h-3 rounded-full bg-slate-400 flex-shrink-0 ring-4 ring-slate-100" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Drop-off (Airport)</p>
            <p className="font-semibold text-gray-900 text-sm">{dropoffLabel}</p>
          </div>
        </div>
      </div>

      {/* Details table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-0 divide-y divide-gray-100">
        <Row label="Passenger"       value={passengerName} />
        <Row label="Fare"            value={formattedPrice} highlight />
        {specialRequests && (
          <Row label="Special Requests" value={specialRequests} />
        )}
      </div>
    </>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-3">
      <span className="font-medium text-gray-500 text-sm">{label}</span>
      <span
        className={`font-semibold text-right max-w-[60%] text-sm ${
          highlight ? "text-teal-700 text-base font-black" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
