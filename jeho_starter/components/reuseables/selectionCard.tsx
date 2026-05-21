import React from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { Loader2, CheckCircle2, ChevronRight } from "lucide-react";

interface SelectionCardProps {
  label: string;
  value: string;
  placeholder: string;
  icon: React.ElementType;
  active?: boolean;
  isLoading?: boolean; 
}


export const SelectionCard = React.forwardRef<HTMLButtonElement, SelectionCardProps>(
  ({ label, value, placeholder, icon: Icon, active, isLoading }, ref) => {
    const hasValue = !!value;

    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "w-full h-auto p-5 rounded-xl border-2 transition-all duration-200 group relative flex items-center justify-between",
          "hover:border-[#2d7a7a] hover:bg-[#f0f9f9]/30",
          (hasValue || active) ? "border-[#2d7a7a] bg-[#f0f9f9]/20" : "border-gray-200"
        )}
      >
        <div className="flex items-center gap-4">   
          <div
            className={cn( "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
              (hasValue || active) ? "bg-[#2d7a7a]/10 text-[#2d7a7a]" : "bg-gray-100 text-gray-400 group-hover:text-[#2d7a7a]"
            )}
          >
            {/* Show Spinner inside the card icon if loading */}
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
          </div>

          <div className="text-left flex flex-col">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span
              className={cn(
                "text-base font-semibold truncate max-w-[200px]",
                hasValue ? "text-gray-900" : "text-gray-400 italic"
              )}
            >
               {/* Show Text loading state */}
              {isLoading ? "Detecting..." : (hasValue ? value : placeholder)}
            </span>
          </div>
        </div>

        <div className="text-gray-300 transition-colors group-hover:text-[#2d7a7a]">
          {hasValue ? <CheckCircle2 className="h-5 w-5 text-[#2d7a7a]" /> : <ChevronRight className="h-5 w-5" />}
        </div>
      </Button>
    );
  }
);
SelectionCard.displayName = "SelectionCard";
