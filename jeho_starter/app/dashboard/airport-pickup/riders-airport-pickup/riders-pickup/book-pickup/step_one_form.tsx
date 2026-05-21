"use client";

import React, { useState } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";

// Constants for easier maintenance and scalability
const TERMINALS = ["Terminal 1", "Terminal 2", "Terminal 3"];
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D"];

export interface StepOneData {
  terminal: string;
  pickupPoint: string;
}

interface StepOneFormProps {
  onNext: (data: StepOneData) => void;
  onBack: () => void;
}

export default function StepOneForm({ onNext, onBack }: StepOneFormProps) {
  const [formData, setFormData] = useState<StepOneData>({
    terminal: "",
    pickupPoint: "Zone C",
  });

  const handleContinue = () => {
    // Production-standard validation
    if (!formData.terminal) {
      alert("Please select a valid Terminal.");
      return;
    }
    onNext(formData);
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto py-10 px-5">
        <div className="py-1">
          <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all" onClick={onBack} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wider">
              Service Type
            </label>
            <div className="flex items-center gap-3 p-4 border-2 border-teal-600 bg-teal-50/30 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                ✓
              </div>
              <span className="font-medium text-teal-900">Airport Pickup</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Select Terminal</label>
            <div className="relative">
              <select 
                value={formData.terminal} 
                onChange={(e) => setFormData({ ...formData, terminal: e.target.value })} 
                className="w-full p-4 pr-10 border-2 border-gray-200 rounded-lg appearance-none focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all bg-white cursor-pointer"
                aria-label="Select Terminal"
              >
                <option value="" disabled>Choose a terminal</option>
                {TERMINALS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Pickup Point</label>
            <div className="relative">
              <select 
                value={formData.pickupPoint} 
                onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })} 
                className="w-full p-4 pr-10 border-2 border-gray-200 rounded-lg appearance-none focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition-all bg-white cursor-pointer"
                aria-label="Pickup Point"
              >
                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
            </div>
          </div>

          <Button onClick={handleContinue} className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold py-6 rounded-lg transition-all shadow-md active:scale-[0.98]" >
            Continue to Step 2
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}