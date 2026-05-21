import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { SelectionCard } from "./selectionCard";
import { CalendarIcon, Check, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TIME_SLOTS } from "../dashboard/airport-pickup/drivers-pickup/driver details";
import { format } from "date-fns";


interface DateTimePickerProps {
  value: string;
  onSave: (date: Date, time: string, formattedString: string) => void;
}

export function DateTimePicker({ value, onSave }: DateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!value) {
      setDate(undefined);
      setTime("");
      return;
    }
  }, [value, open]);

  const handleConfirm = () => {
    if (!date || !time) return;
    const dateStr = format(date, "PPP");
    const finalString = `${dateStr} • ${time}`;
    onSave(date, time, finalString);
    setOpen(false);
  };

  const isComplete = !!date && !!time;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div role="button" tabIndex={0} className="w-full">
          <SelectionCard
            label="Availability Schedule"
            value={value} 
            placeholder="Select date & time"
            icon={CalendarIcon}
            active={open}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-teal-200" align="start">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border-none"
            />
          </div>
          <div className="p-3 flex flex-col gap-2 w-[200px]">
            <div className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" /> Available Times
            </div>
            <div className="h-[280px] overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {TIME_SLOTS.map((slot) => (
                <Button
                  key={slot}
                  variant={time === slot ? "default" : "ghost"}
                  size="sm"
                  className={cn("w-full justify-start font-normal", time === slot ? "bg-[#2d7a7a] hover:bg-[#246060] text-white" : "hover:bg-gray-100")}
                  onClick={() => setTime(slot)}
                >
                  {slot}
                  {time === slot && <Check className="ml-auto h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
          <span className="text-xs text-muted-foreground pl-2">
            {date && time ? "Ready to apply" : "Select date & time"}
          </span>
          <Button size="sm" disabled={!isComplete} onClick={handleConfirm} className={cn( "transition-all duration-200", isComplete ? "bg-[#2d7a7a] hover:bg-[#246060]" : "bg-gray-300" )}>
            Apply Schedule
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
