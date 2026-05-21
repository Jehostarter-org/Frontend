import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SelectionCard } from "./selectionCard";
import { useCurrentLocation } from "@/hooks/use-geolocation";
import { Check, Loader2, LocateFixed, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { LOCATIONS } from "../dashboard/airport-pickup/drivers-pickup/driver details";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";


interface LocationPickerProps {
  value: string;
  onSelect: (val: string) => void;
}

export function LocationPicker({ value, onSelect }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const { getCurrentLocation, isLocating, data, error } = useCurrentLocation();
  const isLoading = isLocating;

  useEffect(() => {
    if (data?.address) {
      onSelect(data.address);
      setOpen(false);
    }
  }, [data, onSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div role="button" tabIndex={0} className="w-full">
          <SelectionCard
            label="Pick a Location"
            value={value}
            placeholder="Search or use current location..."
            icon={MapPin}
            active={open}
            isLoading={isLoading}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[350px] sm:w-[400px] bg-white border-none" align="start">
        <Command>
          <CommandInput className="border-none" placeholder="Search airport or city..." />
          <CommandList>
            <CommandEmpty>No location found.</CommandEmpty>
            
            <CommandGroup>
              <CommandItem onSelect={() => getCurrentLocation()} className="cursor-pointer text-[#2d7a7a] font-medium data-[selected='true']:bg-[#2d7a7a]/10 py-3" disabled={isLoading} >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LocateFixed className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Detecting location..." : "Use Current Location"}
              </CommandItem>
                {error && (
                    <div className="px-3 py-2 text-xs text-red-500 font-medium bg-red-50 border-t border-red-100">
                        Unable to fetch location: {error}
                    </div>
                )}
            </CommandGroup>
            <CommandSeparator />

            <CommandGroup heading="Suggestions">
              {LOCATIONS.map((location) => (
                <CommandItem
                  key={location.value}
                  value={location.label}
                  onSelect={() => {
                    onSelect(location.label);
                    setOpen(false);
                  }}
                  className="cursor-pointer py-3"
                >
                  <MapPin className={cn( "mr-2 h-4 w-4 transition-colors", value === location.label ? "text-[#2d7a7a]" : "text-gray-400")} />
                  <span className={cn( "flex-1 truncate", value === location.label && "font-medium text-[#2d7a7a]" )}>
                    {location.label}
                  </span>
                  <Check className={cn( "ml-auto h-4 w-4 text-[#2d7a7a]", value === location.label ? "opacity-100" : "opacity-0" )} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}