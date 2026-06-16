"use client";

import { Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { VehicleOption } from "@/components/dashboard/airport-pickup/riders-pickup/vehicle-stats";

interface VehicleCardProps {
  vehicle: VehicleOption;
  isSelected: boolean;
  onSelect: () => void;
  formattedPrice: string;
  originalPrice?: number;
  originalFormattedPrice?: string;
}

export function VehicleCard({
  vehicle,
  isSelected,
  onSelect,
  formattedPrice,
  originalPrice,
  originalFormattedPrice
}: VehicleCardProps) {
  const hasDiscount = originalPrice && originalPrice !== vehicle.price;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden",
        "hover:shadow-lg hover:-translate-y-1",
        isSelected
          ? "border-teal-500 bg-gradient-to-br from-teal-50/50 to-white shadow-lg shadow-teal-100"
          : "border-gray-200 bg-white hover:border-teal-200"
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-black text-gray-900">{vehicle.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{vehicle.description}</p>

            {/* Price Display with optional original price */}
            <div className="mt-3">
              {hasDiscount ? (
                <div className="space-y-0.5">
                  <p className="text-2xl font-black text-teal-600">
                    {formattedPrice}
                  </p>
                  <p className="text-sm text-gray-400 line-through">
                    {originalFormattedPrice}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-black text-teal-600">
                  {formattedPrice}
                </p>
              )}
            </div>
          </div>

          <div className={cn(
            "p-3 rounded-full transition-colors",
            isSelected ? "bg-teal-100" : "bg-gray-100"
          )}>
            <Car className={cn(
              "w-6 h-6 transition-colors",
              isSelected ? "text-teal-600" : "text-gray-500"
            )} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="font-bold">👥</span> {vehicle.capacity} seats
          </span>
          <span className="flex items-center gap-1">
            <span className="font-bold">🧳</span> {vehicle.luggage} bags
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}