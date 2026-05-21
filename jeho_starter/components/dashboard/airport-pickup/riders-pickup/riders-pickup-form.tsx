"use client";

import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAirportData } from "@/hooks/useAirportData";
import { FormSelect } from "@/components/reuseables/formSelect";
import { useBookAirportPickupMutation } from "@/lib/api/riderApiSlice";
import { LocationSearch } from "@/components/reuseables/locationSearch";
import { bookingSchema } from "@/components/types/schemas/riders-booking-scehma";
import { ArrowLeft, CheckCircle2, Loader2, Calendar, Clock, PlaneLanding, Search, MapPin } from "lucide-react";


type BookingFormData = z.infer<typeof bookingSchema>;

interface StepOneProps {
  onNext?: (data: BookingFormData) => void;
  defaultValues?: Partial<BookingFormData>;
}

export default function StepOneBookPickup({ onNext, defaultValues }: StepOneProps) {
  const router = useRouter();
  const [bookPickup, { isLoading: isApiLoading }] = useBookAirportPickupMutation();
  const { airports, terminals, pickupZones, isLoading: isDataLoading } = useAirportData();
  const [airportSearch, setAirportSearch] = useState("");
  const [isAirportSelected, setIsAirportSelected] = useState(!!defaultValues?.airport);

  const { control, register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<BookingFormData>({
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
    return airports.filter(a => 
      a.label.toLowerCase().includes(airportSearch.toLowerCase()) || 
      a.value.toLowerCase().includes(airportSearch.toLowerCase())
    ).slice(0, 5);
  }, [airportSearch, airports, isAirportSelected]);

  const onSubmit = async (data: BookingFormData) => {
    try {
      const formattedTime = data.arrivalTime.length === 5 ? `${data.arrivalTime}:00` : data.arrivalTime;
      const backendPayload = {
        airport: data.airport,
        terminal: data.terminal,
        destination: data.destination,
        pickUpPoint: data.pickupPoint,
        arrivalDate: data.arrivalDate,
        estimatedArrivalTime: formattedTime
      };
      await bookPickup(backendPayload).unwrap();
      toast.success("Details confirmed! Choose your vehicle.");
    
      if (onNext) {
        onNext(data);
      } else {
        router.push("/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/vehicle-selection");
      }
    } catch (error: any) {
      const errorMsg = error?.data?.message || "Please check your input details.";
      toast.error(errorMsg);
      console.error("Backend Error Details:", error);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return ( 
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="mb-6">
        <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Request an Airport Ride</h2>
        <p className="text-gray-500 font-medium">Tell us where you're landing and where you're headed.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl border border-gray-100 shadow-2xl shadow-teal-900/10">
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
            <div className="space-y-2 relative">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 px-1">
                <Search className="w-4 h-4 text-teal-600" /> Arrival Airport
              </label>
              <div className="relative">
                <Input 
                  placeholder="Which airport are you landing at?" 
                  value={isAirportSelected ? selectedAirport : airportSearch} 
                  onChange={(e) => { setAirportSearch(e.target.value); setIsAirportSelected(false); setValue("airport", ""); }}
                  className={cn( "h-14 pl-5 rounded-lg bg-gray-50 border-gray-200 transition-all focus:bg-white",
                    errors.airport && "border-destructive focus:ring-destructive", isAirportSelected && "text-teal-700 font-bold border-teal-200 bg-teal-50/20"
                  )}
                />
                {isAirportSelected && (
                   <Button onClick={() => {setIsAirportSelected(false); setAirportSearch("");}} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" >
                     <MapPin className="w-5 h-5" />
                   </Button>
                )}

                {filteredAirports.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {filteredAirports.map((a) => (
                      <button key={a.value} type="button" 
                        className="w-full text-left px-5 py-4 hover:bg-teal-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                        onClick={() => { setValue("airport", a.label, { shouldValidate: true }); setAirportSearch(""); setIsAirportSelected(true); }}
                      >
                        <span className="font-semibold text-gray-800">{a.label}</span>
                        <span className="text-xs font-bold text-teal-600 bg-teal-100/50 px-2.5 py-1 rounded-lg uppercase">{a.value}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.airport && <p className="text-xs font-bold text-destructive px-1">{errors.airport.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormSelect id="terminal" label="Terminal" options={terminals} registration={register("terminal")} error={errors.terminal?.message} />
              <FormSelect id="pickupPoint" label="Meeting Point" options={pickupZones} registration={register("pickupPoint")} error={errors.pickupPoint?.message} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-gray-50/50 rounded-lg border border-gray-100">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-black text-gray-500 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Arrival Date
                </label>
                <Input type="date" min={today} {...register("arrivalDate")} className="h-12 bg-white rounded-md border-gray-200" />
                {errors.arrivalDate && <p className="text-xs font-bold text-destructive">{errors.arrivalDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-black text-gray-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Est. Pickup Time
                </label>
                <Input type="time" {...register("arrivalTime")} className="h-12 bg-white rounded-md border-gray-200" />
                {errors.arrivalTime && <p className="text-xs font-bold text-destructive">{errors.arrivalTime.message}</p>}
              </div>
            </div>

            <Controller control={control} name="destination" render={({ field }) => ( 
                <LocationSearch 
                  label="Where are we taking you? (Drop-off)" 
                  value={field.value} 
                  onChange={field.onChange} 
                  error={errors.destination?.message} 
                /> 
              )}
            />
          </div>
        )}

        <Button type="submit" disabled={!isValid || isDataLoading || isApiLoading} className={cn( "w-full py-8 text-lg font-black rounded-sm transition-all shadow-xl",
            "bg-teal-700 hover:bg-teal-800 text-white hover:shadow-teal-900/20 active:scale-[0.98]", "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          )}
        >
          {isApiLoading ? (
            <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing...</>
          ) : (
            "Continue to Vehicle Selection"
          )}
        </Button>
      </form>
    </div>
  );
}