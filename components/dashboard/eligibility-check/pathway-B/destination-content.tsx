"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo } from "react";
import { Globe, Mail, Phone, MapPin, Loader2, CheckCircle } from "lucide-react";


interface StepFourDestinationContactProps {
  onNext: (data: { 
    destinationCountry: string; 
    destinationCity: string; 
    email: string; 
    phone: string; 
  }) => void;
}

export function StepFourDestinationContact({ onNext }: StepFourDestinationContactProps) {
  const [formData, setFormData] = useState({
    destinationCountry: "",
    destinationCity: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      const filtered = value.replace(/[^\d+]/g, "");
      setFormData((prev) => ({ ...prev, [name]: filtered }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validation = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(formData.email);
    const isPhoneValid = formData.phone.length >= 10;
    const isLocationValid = formData.destinationCountry.trim().length > 1 && formData.destinationCity.trim().length > 1;

    return {
      isValid: isEmailValid && isPhoneValid && isLocationValid, isEmailValid, isPhoneValid
    };
  }, [formData]);

  const handleSubmit = async () => {
    if (!validation.isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      onNext(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Step 3: Destination & Contact Details</h2>
        <p className="text-gray-600">
          Almost finished! Provide your destination details so we can finalize your pre-eligibility status.
        </p>
      </header>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#2d7a7a]" /> Destination Country
            </label>
            <Input
              name="destinationCountry"
              placeholder="e.g., Australia"
              value={formData.destinationCountry}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-12 focus-visible:ring-[#2d7a7a]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#2d7a7a]" /> Destination City
            </label>
            <Input
              name="destinationCity"
              placeholder="e.g., Sydney"
              value={formData.destinationCity}
              onChange={handleChange}
              disabled={isSubmitting}
              className="h-12 focus-visible:ring-[#2d7a7a]"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#2d7a7a]" /> Email Address
            </label>
            <Input name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} disabled={isSubmitting}
              className={cn( "h-12 focus-visible:ring-[#2d7a7a]", !validation.isEmailValid && formData.email.length > 5 && "border-amber-400 bg-amber-50/30" )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-tight flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#2d7a7a]" /> Local Phone Number
            </label>
            <Input name="phone" type="tel" placeholder="+1234567890" value={formData.phone} onChange={handleChange} disabled={isSubmitting} className="h-12 focus-visible:ring-[#2d7a7a]" />
            <p className="text-[10px] text-gray-400 italic px-1">
              Numeric characters only. Include country code.
            </p>
          </div>
        </div>

        <div className="pt-6">
          <Button onClick={handleSubmit} disabled={!validation.isValid || isSubmitting}
            className={cn( "w-full h-14 text-white text-lg font-bold transition-all shadow-md group", validation.isValid && !isSubmitting ? "bg-[#2d7a7a] hover:bg-[#1f5a5a]" : "bg-gray-200"
          )} >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Finalizing Registration...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Complete Pre-Eligibility <CheckCircle className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            )}
          </Button>
          
          <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
            By completing this step, your data will be submitted for a final check against our Home Country Eligibility standards.
          </p>
        </div>
      </div>
    </div>
  );
}