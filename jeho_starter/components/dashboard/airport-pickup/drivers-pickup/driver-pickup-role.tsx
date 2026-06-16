"use client";

import { Car, User } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = "driver" | "rider";

interface StepZeroProps {
  selectedOption: UserRole | null;
  onSelect: (option: UserRole) => void;
}

export function StepZeroRoleSelection({ selectedOption, onSelect }: StepZeroProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <p className="text-center text-gray-500 text-sm">
        How would you like to use airport pickup?
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelect("driver")}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200",
            selectedOption === "driver"
              ? "border-[#2d7a7a] bg-[#2d7a7a]/5 shadow-md"
              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              selectedOption === "driver"
                ? "bg-[#2d7a7a] text-white"
                : "bg-gray-100 text-gray-500"
            )}
          >
            <Car className="w-7 h-7" />
          </div>
          <span className="font-semibold text-gray-900">Driver</span>
          <span className="text-xs text-gray-500 text-center">
            Offer rides and earn
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("rider")}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200",
            selectedOption === "rider"
              ? "border-[#2d7a7a] bg-[#2d7a7a]/5 shadow-md"
              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              selectedOption === "rider"
                ? "bg-[#2d7a7a] text-white"
                : "bg-gray-100 text-gray-500"
            )}
          >
            <User className="w-7 h-7" />
          </div>
          <span className="font-semibold text-gray-900">Rider</span>
          <span className="text-xs text-gray-500 text-center">
            Book a pickup ride
          </span>
        </button>
      </div>
    </div>
  );
}
