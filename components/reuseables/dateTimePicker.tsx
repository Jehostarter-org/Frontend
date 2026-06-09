// components/reuseables/dateTimePicker.tsx

"use client";

import { useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

interface DateTimePickerProps {
  value: string;
  onSave: (date: Date | undefined, time: string, formattedString: string) => void;
}

export function DateTimePicker({ value, onSave }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [selectedTime, setSelectedTime] = useState("");

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setSelectedDate(date);
    if (date && selectedTime) {
      const formatted = format(date, "MMM dd, yyyy") + ` at ${selectedTime}`;
      onSave(date, selectedTime, formatted);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const time = e.target.value;
    setSelectedTime(time);
    if (selectedDate && time) {
      const formatted = format(selectedDate, "MMM dd, yyyy") + ` at ${time}`;
      onSave(selectedDate, time, formatted);
    }
  };

  const timeSlots = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
  ];

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        When are you available?
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            onChange={handleDateChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            min={format(new Date(), "yyyy-MM-dd")}
          />
        </div>

        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectedTime}
            onChange={handleTimeChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">Select time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedDate && selectedTime && (
        <div className="mt-2 p-3 bg-teal-50 rounded-lg">
          <p className="text-sm text-teal-800">
            You'll be available on <strong>{format(selectedDate, "MMMM dd, yyyy")}</strong> at <strong>{selectedTime}</strong>
          </p>
        </div>
      )}
    </div>
  );
}