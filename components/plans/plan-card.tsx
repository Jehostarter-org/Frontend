"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlanConfig } from "@/lib/constants/plans"; 
import { CheckCircle2, Loader2, Check } from "lucide-react";

interface PlanCardProps {
  plan: PlanConfig;
  isSelected: boolean;
  isLoading: boolean;
  isCurrentPlan?: boolean;
  isDisabled?: boolean;
  disabledLabel?: string;
  onSelect: (id: string) => void;
  onAction: () => void;
}

export const PlanCard = ({
  plan,
  isSelected,
  isLoading,
  isCurrentPlan = false,
  isDisabled = false,
  disabledLabel = "Membership status unavailable",
  onSelect,
  onAction,
}: PlanCardProps) => {
  const isGold = plan.theme === "dark";

  return (
    <div
      onClick={() => {
        if (!isCurrentPlan) onSelect(plan.id);
      }}
      className={cn( "relative rounded-3xl p-8 transition-all duration-300 border h-full flex flex-col group", isCurrentPlan ? "cursor-not-allowed" : "cursor-pointer", isGold 
          ? "bg-slate-950 text-white border-transparent hover:shadow-2xl shadow-xl" : "bg-white text-slate-900 border-gray-200 hover:shadow-lg",
        isSelected && isGold && "ring-2 ring-yellow-500 scale-[1.02]", isSelected && !isGold && "ring-2 ring-teal-600 scale-[1.02]"
      )}
    >
      {(isCurrentPlan || isSelected) && (
        <div className={cn(  "absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-in zoom-in", isGold ? "bg-yellow-500 text-black" : "bg-teal-600 text-white" )}>
          <CheckCircle2 className="w-3.5 h-3.5" /> {isCurrentPlan ? "Current Plan" : "Selected"}
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className={cn("text-2xl font-bold mb-3", isGold && "text-yellow-400")}>
          {plan.title}
        </h2>
        <p className={cn("text-sm h-10 px-4 leading-relaxed", isGold ? "text-gray-400" : "text-gray-500")}>
          {plan.description}
        </p>
        <div className="text-4xl font-extrabold mt-6">{plan.priceLabel}</div>
      </div>

      <ul className={cn("space-y-4 mb-8 flex-grow", isGold ? "text-gray-300" : "text-gray-600")}>
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-sm">
            <div className={cn( "mt-1 shrink-0 w-5 h-5 rounded-full flex items-center justify-center", isGold ? "bg-yellow-500/20 text-yellow-500" : "bg-teal-100 text-teal-700" )}>
              <Check className="w-3 h-3" />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4">
        <Button onClick={(e) => { e.stopPropagation(); onAction(); }}
          disabled={!isSelected || isLoading || isCurrentPlan || isDisabled}
          className={cn( "w-full h-12 text-base font-semibold rounded-xl transition-all shadow-lg", isGold 
              ? "bg-yellow-500 text-black hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500" 
              : "bg-teal-700 text-white hover:bg-teal-800 disabled:bg-gray-100 disabled:text-gray-400"
          )}
        >
          {isLoading && isSelected ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : isDisabled ? (
            disabledLabel
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
};