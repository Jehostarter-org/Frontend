"use client";

import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAirportData } from "@/hooks/useAirportData";
import { FormSelect } from "@/components/reuseables/formSelect";
import { useCurrency, COUNTRY_TO_CURRENCY } from "@/components/contexts/currencyContext";
import { useBookAirportPickupMutation, useCalculateDistanceMutation, useUpdateServiceDistanceMutation } from "@/lib/api/riderApiSlice";
import { LocationSearch } from "@/components/reuseables/locationSearch";
import { bookingSchema } from "@/components/types/schemas/riders-booking-scehma";
import {
  ArrowLeft, CheckCircle2, Loader2, Calendar, Clock,
  PlaneLanding, Search, MapPin,
} from "lucide-react";

type BookingFormData = z.infer<typeof bookingSchema>;

interface StepOneProps {
  onNext?: (data: BookingFormData & { serviceRequestId: string }) => void;
  defaultValues?: Partial<BookingFormData>;
}

export default function StepOneBookPickup({ onNext, defaultValues }: StepOneProps) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [bookPickup, { isLoading: isApiLoading }] = useBookAirportPickupMutation();
  const [calculateDistance] = useCalculateDistanceMutation();
  const [updateServiceDistance] = useUpdateServiceDistanceMutation();
  const { currency: detectedCurrency, countryCode: detectedCountry } = useCurrency();
  const { airports, terminals, pickupZones, isLoading: isDataLoading } = useAirportData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airportSearch, setAirportSearch] = useState("");
  const [isAirportSelected, setIsAirportSelected] = useState(!!defaultValues?.airport);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [airportCoords, setAirportCoords] = useState<{ lat: number; lon: number } | null>(null);

  const {
    control, register, handleSubmit, setValue, watch,
    formState: { errors, isValid },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      airport: defaultValues?.airport || "",
      terminal: defaultValues?.terminal || "",
      pickupPoint: defaultValues?.pickupPoint || "",
      destination: defaultValues?.destination || "",
      arrivalDate: defaultValues?.arrivalDate || "",
      arrivalTime: defaultValues?.arrivalTime || "",
    },
    mode: "onChange",
  });

  const selectedAirport = watch("airport");

  const filteredAirports = useMemo(() => {
    if (!airportSearch || isAirportSelected) return [];
    return airports
      .filter(
        (a) =>
          a.label.toLowerCase().includes(airportSearch.toLowerCase()) ||
          a.value.toLowerCase().includes(airportSearch.toLowerCase())
      )
      .slice(0, 5);
  }, [airportSearch, airports, isAirportSelected]);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Combine date + time into ISO datetime the backend expects
      const arrivalDatetime = `${data.arrivalDate}T${data.arrivalTime}:00`;

      // The booking must be routed to drivers near the AIRPORT, not near the
      // rider. e.g. a rider in Nigeria booking Brisbane → country_code "AU" so
      // every approved Australian driver gets notified.
      const airportInfo = airports.find(
        (a) => a.label === data.airport || a.value === data.airport
      );
      const bookingCountry =
        airportInfo?.country || detectedCountry || user?.current_country || "NG";
      const bookingCurrency = COUNTRY_TO_CURRENCY[bookingCountry] ?? detectedCurrency;
      const isCrossCountry = !!airportInfo && user?.current_country !== bookingCountry;
      const bookingCity = isCrossCountry ? "" : user?.city || "";

      // Prepare payload matching Django serializer expectations EXACTLY
      const payload = {
        service_type: "airport_pickup" as const,
        description: `Airport pickup from ${data.airport} to ${data.destination || "TBD"}`,
        country_code: bookingCountry,
        city: bookingCity,
        destination: data.destination || "",
        notes: data.destination,
        airport_pickup_details: {
          airport: data.airport,
          terminal: data.terminal || "",
          pickup_point: data.pickupPoint || "",
          arrival_date: data.arrivalDate,
          estimated_arrival_time: data.arrivalTime,
          num_passengers: 1,
          num_bags: 1,
          flight_number: "",
          special_requests: "",
        }
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await bookPickup(payload).unwrap();

      console.log("Response received:", response);

      // ── Calculate distance & price BEFORE navigating ──────────────────
      const serviceRequestId = response.id;
      const pickupAddr = data.airport || "";
      const arrivalAddr = data.destination || "";
      const countryCode = bookingCountry;
      const city = bookingCity;

      try {
        // 1. Calculate distance & price — pass coordinates when available
        const distResult = await calculateDistance({
          pickup_address: pickupAddr,
          pickup_city: city,
          pickup_country: countryCode,
          arrival_address: arrivalAddr,
          arrival_city: city,
          arrival_country: countryCode,
          vehicle_type: "regular",
          // Pass coordinates from picker to avoid re-geocoding
          ...(destinationCoords
            ? { arrival_lat: destinationCoords.lat, arrival_lon: destinationCoords.lon }
            : {}),
          ...(airportCoords
            ? { pickup_lat: airportCoords.lat, pickup_lon: airportCoords.lon }
            : {}),
        }).unwrap();

        console.log("Distance calc result:", distResult);

        // Persist calculated values so vehicle-selection can read them
        sessionStorage.setItem("calculatedPrice", String(distResult.total_price));
        sessionStorage.setItem("calculatedCurrency", bookingCurrency);
        sessionStorage.setItem("tripDistance", String(distResult.distance_km));
        sessionStorage.setItem("tripDuration", String(distResult.duration_min));
        sessionStorage.setItem("flagDropFee", String(distResult.flag_drop_fee));
        sessionStorage.setItem("perKmRate", String(distResult.per_km_rate));
        sessionStorage.setItem("distanceCharge", String(distResult.distance_charge));
        sessionStorage.setItem("minimumFare", String(distResult.minimum_fare));

        // 2. Persist distance on the service request itself
        await updateServiceDistance({
          serviceRequestId,
          pickup_address: pickupAddr,
          arrival_address: arrivalAddr,
          ...(destinationCoords
            ? { arrival_lat: destinationCoords.lat, arrival_lon: destinationCoords.lon }
            : {}),
          ...(airportCoords
            ? { pickup_lat: airportCoords.lat, pickup_lon: airportCoords.lon }
            : {}),
        }).unwrap();
      } catch (distErr) {
        console.warn("Distance calculation failed:", distErr);
        toast.warning("Could not calculate trip distance. Price may be estimated.");
      }
      // ─────────────────────────────────────────────────────────────────

      toast.success("Details confirmed! Choose your vehicle.");

      if (onNext) {
        onNext({ ...data, serviceRequestId });
      } else {
        sessionStorage.setItem("activeServiceRequestId", serviceRequestId);
        router.push(
          "/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/vehicle-selection"
        );
      }
    } catch (error: any) {
      // RTK Query unwrap() throws { status, data } or { status, error }
      const status = error?.status ?? error?.statusCode;
      const data   = error?.data ?? error?.error;
      console.error("[bookPickup] status:", status, "data:", data, "raw:", error);

      let errorMessage = "Something went wrong. Please try again.";

      if (data && typeof data === "object") {
        // DRF validation errors: { field: ["msg", ...] }
        if (data.airport_pickup_details) {
          const details = data.airport_pickup_details;
          // Find the first field-level error
          const firstField = Object.keys(details).find((k) =>
            Array.isArray(details[k]) && details[k].length > 0,
          );
          errorMessage = firstField
            ? `${firstField}: ${details[firstField][0]}`
            : Object.values(details).flat().join(", ");
        } else if (data.non_field_errors) {
          errorMessage = data.non_field_errors.join(", ");
        } else if (data.detail) {
          errorMessage = data.detail;
        } else {
          // Generic: pick the first key with a message
          const firstKey = Object.keys(data).find((k) => data[k]);
          if (firstKey) {
            const val = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
            errorMessage = `${firstKey}: ${val}`;
          }
        }
      } else if (typeof data === "string") {
        errorMessage = data;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (status === 401 || status === 403) {
        errorMessage = "Please log in to continue.";
      }

      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 border border-gray-100">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-teal-600 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-800">Booking your ride...</p>
            <p className="text-sm text-gray-400">Calculating the best fare for you</p>
          </div>
        </div>
      )}
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Request an Airport Ride
        </h2>
        <p className="text-gray-500 font-medium">
          Tell us where you're landing and where you're headed.
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 bg-white p-8 rounded-xl border border-gray-100 shadow-2xl shadow-teal-900/10"
      >
        <div className="flex items-center gap-4 p-5 border border-teal-100 bg-teal-50/40 rounded-lg">
          <div className="p-3 bg-teal-600 rounded-lg shadow-lg">
            <PlaneLanding className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-teal-600 font-bold">Step 1 of 3</p>
            <p className="text-teal-900 font-extrabold text-lg">Trip Details</p>
          </div>
          {isValid && <CheckCircle2 className="w-7 h-7 text-teal-600 animate-in zoom-in" />}
        </div>

        {isDataLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin h-10 w-10 text-teal-600" />
            <p className="text-sm font-bold text-gray-400">Loading airport data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Airport Search */}
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                <Search className="w-4 h-4 text-teal-600" /> Arrival Airport
              </label>
              <div className="relative">
                <Input
                  placeholder="Which airport are you landing at?"
                  value={isAirportSelected ? selectedAirport : airportSearch}
                  onChange={(e) => {
                    setAirportSearch(e.target.value);
                    setIsAirportSelected(false);
                    setValue("airport", "");
                  }}
                  className={cn(
                    "h-14 pl-5 rounded-lg bg-gray-50 border-gray-200 transition-all focus:bg-white",
                    errors.airport && "border-destructive focus:ring-destructive",
                    isAirportSelected && "text-teal-700 font-bold border-teal-200 bg-teal-50/20"
                  )}
                />
                {isAirportSelected && (
                  <Button
                    type="button"
                    onClick={() => {
                      setIsAirportSelected(false);
                      setAirportSearch("");
                      setValue("airport", "");
                    }}
                    variant="ghost"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <MapPin className="w-5 h-5" />
                  </Button>
                )}
                {filteredAirports.length > 0 && !isAirportSelected && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {filteredAirports.map((a) => (
                      <button
                        key={a.value}
                        type="button"
                        className="w-full text-left px-5 py-4 hover:bg-teal-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                        onClick={() => {
                          setValue("airport", a.label, { shouldValidate: true });
                          setAirportSearch("");
                          setIsAirportSelected(true);
                          if (a.lat && a.lng) setAirportCoords({ lat: a.lat, lon: a.lng });
                        }}
                      >
                        <span className="font-semibold text-gray-800">{a.label}</span>
                        <span className="text-xs font-bold text-teal-600 bg-teal-100/50 px-2.5 py-1 rounded-lg uppercase">
                          {a.value}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.airport && (
                <p className="text-xs font-bold text-destructive px-1">{errors.airport.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormSelect
                id="terminal"
                label="Terminal"
                options={terminals}
                registration={register("terminal")}
                error={errors.terminal?.message}
              />
              <FormSelect
                id="pickupPoint"
                label="Meeting Point"
                options={pickupZones}
                registration={register("pickupPoint")}
                error={errors.pickupPoint?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-gray-50/50 rounded-lg border border-gray-100">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-black text-gray-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Arrival Date
                </label>
                <Input
                  type="date"
                  min={today}
                  {...register("arrivalDate")}
                  className="h-12 bg-white rounded-md border-gray-200"
                />
                {errors.arrivalDate && (
                  <p className="text-xs font-bold text-destructive">{errors.arrivalDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-black text-gray-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Arrival Time
                </label>
                <Input
                  type="time"
                  {...register("arrivalTime")}
                  className="h-12 bg-white rounded-md border-gray-200"
                />
                {errors.arrivalTime && (
                  <p className="text-xs font-bold text-destructive">{errors.arrivalTime.message}</p>
                )}
              </div>
            </div>

            <Controller
              control={control}
              name="destination"
              render={({ field }) => (
                <LocationSearch
                  label="Drop-off Location"
                  value={field.value}
                  onChange={field.onChange}
                  onCoordinatesChange={setDestinationCoords}
                  error={errors.destination?.message}
                />
              )}
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={!isValid || isDataLoading || isSubmitting}
          className={cn(
            "w-full py-8 text-lg font-black rounded-sm transition-all shadow-xl",
            "bg-teal-700 hover:bg-teal-800 text-white hover:shadow-teal-900/20 active:scale-[0.98]",
            "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing...
            </>
          ) : (
            "Continue to Vehicle Selection"
          )}
        </Button>
      </form>
    </div>
    </>
  );
}