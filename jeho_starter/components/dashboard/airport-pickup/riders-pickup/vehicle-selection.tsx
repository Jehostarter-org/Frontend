"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Car, Info, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VehicleOption } from "./vehicle-stats";
import { VehicleCard } from "@/components/reuseables/vehicle-card";
import { useGetVehicleTypesQuery } from "@/lib/api/riderApiSlice";

interface StepTwoProps {
  onNext?: (vehicle: VehicleOption) => void;
  onBack?: () => void;
  defaultSelectedId?: string;
}

export default function StepTwoVehicleSelection({ onNext, defaultSelectedId }: StepTwoProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string>(defaultSelectedId || "");
  const { data: vehicleTypes, isLoading, error, refetch } = useGetVehicleTypesQuery(undefined);

  const selectedVehicle = useMemo(() => 
    vehicleTypes?.find((v: VehicleOption) => v.id === selectedId),
    [vehicleTypes, selectedId]
  );

  const handleContinue = () => {
    if (!selectedVehicle) return;

    if (onNext) {
      onNext(selectedVehicle);
    } else {
      router.push("/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/direction");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-6" onClick={() => router.back()} >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-100">
          <div className="w-2 h-2 rounded-full bg-teal-300" />
          <div className="w-6 h-2 rounded-full bg-teal-600" />
          <div className="w-2 h-2 rounded-full bg-teal-300" />
          <span className="text-xs font-bold text-teal-800 ml-2 uppercase tracking-wider">Step 2 of 3</span>
        </div>
      </div>

      <div className="space-y-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Select your ride</h2>
          <p className="text-gray-500 font-medium mt-1">
            {selectedId 
              ? `You've selected the ${selectedVehicle?.name}. Great choice!` 
              : "Choose the ride that suits your comfort and budget."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 w-full bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
            ))
          ) : error ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 bg-red-50 rounded-3xl border border-red-100">
              <Info className="h-10 w-10 text-red-500 mb-4" />
              <p className="text-red-800 font-bold text-lg">Failed to load vehicles</p>
              <Button variant="outline" className="mt-4 border-red-200 text-red-700 hover:bg-red-100" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : vehicleTypes?.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
              <Car className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No vehicles available at this time.</p>
            </div>
          ) : (
            vehicleTypes?.map((vehicle: VehicleOption) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedId === vehicle.id}
                onSelect={() => setSelectedId(vehicle.id)}
                formattedPrice={formatCurrency(vehicle.price)}
              />
            ))
          )}
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100">
          <p className="text-sm text-gray-400 font-medium text-center md:text-left">
            Prices include VAT and airport surcharges where applicable.
          </p>
          <Button
            onClick={handleContinue}
            disabled={!selectedId || isLoading}
            className={cn(
              "w-full md:w-auto md:min-w-[280px] py-8 text-xl font-black rounded-2xl transition-all shadow-xl",
              "bg-teal-700 hover:bg-teal-800 text-white shadow-teal-900/10 active:scale-[0.98]", 
              "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
            )}
          >
            {selectedVehicle ? (
              <span className="flex items-center gap-2">
                Continue with {selectedVehicle.name} <span className="opacity-40">|</span> {formatCurrency(selectedVehicle.price)}
              </span>
            ) : (
              "Select a Vehicle"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}