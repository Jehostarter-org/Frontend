"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { CheckCircle2, Users, Briefcase } from "lucide-react";
import { VehicleOption } from "../dashboard/airport-pickup/riders-pickup/vehicle-stats";

interface VehicleCardProps {
  vehicle: VehicleOption;
  isSelected: boolean;
  onSelect: () => void;
  formattedPrice: string;
}

export function VehicleCard({ vehicle, isSelected, onSelect, formattedPrice }: VehicleCardProps) {
  return (
    <div onClick={onSelect} className={cn(
        "relative cursor-pointer rounded-[2rem] border-2 p-5 transition-all duration-300", "flex items-center gap-4 group hover:shadow-xl hover:shadow-teal-900/5",
        isSelected ? "border-teal-600 bg-teal-50/30 ring-4 ring-teal-50" : "border-gray-100 bg-white hover:border-teal-200"
      )}
    >
      <div className="relative w-32 h-24 md:w-40 md:h-28 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50 p-2">
        <Image src={vehicle.image || "/images/vehicles/placeholder-car.png"} alt={vehicle.name} fill
          className={cn( "object-contain transition-transform duration-500", isSelected ? "scale-110" : "group-hover:scale-105"
          )}
        />
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">{vehicle.name}</h3>
          {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
        </div>
        
        <p className="text-xs text-gray-500 line-clamp-1">{vehicle.description}</p>
        
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
            <Users className="w-3 h-3" /> {vehicle.capacity || 4}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
            <Briefcase className="w-3 h-3" /> {vehicle.luggage || 2}
          </div>
        </div>

        <div className="pt-2">
          <span className="text-teal-700 font-extrabold text-lg">{formattedPrice}</span>
        </div>
      </div>
    </div>
  );
}