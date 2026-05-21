"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, AlertCircle } from "lucide-react";


interface StepTwoVisaVerificationProps {
  onNext: (data: { visaExpiry: string; file: File | null }) => void;
}

export function StepTwoVisaVerification({ onNext }: StepTwoVisaVerificationProps) {
  const [file, setFile] = useState<File | null>(null);
  const [visaExpiry, setVisaExpiry] = useState("");
  const [uploadType, setUploadType] = useState<"passport" | "vevo">("passport");

  const validation = useMemo(() => {
    if (!visaExpiry) return { isEligible: false, error: null };

    const selectedDate = new Date(visaExpiry);
    const today = new Date();
    const minRequiredDate = new Date();
    minRequiredDate.setFullYear(today.getFullYear() + 2);

    const isEligible = selectedDate >= minRequiredDate;
    
    return {
      isEligible, error: !isEligible 
        ? `Ineligible: Your visa expires before ${minRequiredDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. A minimum of 2 years validity is required.`
        : null
    };
  }, [visaExpiry]);

  const isValid = file && visaExpiry && validation.isEligible;

  const handleSubmit = () => {
    if (isValid) {
      onNext({ visaExpiry, file });
    }
  };

  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Step 1: Visa Verification</h2>
        <p className="text-gray-600">
          Upload proof of your valid visa. Your visa must be valid for at least 2 more years to qualify for Gold Membership.
        </p>
      </header>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
           <label className="text-sm font-medium text-gray-900">
            {uploadType === "passport" ? "Upload Passport & Visa Page" : "Upload VEVO Check"}
          </label>
          <div className={cn( "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer hover:bg-teal-50/30",
            file ? "border-green-500 bg-green-50/30" : "border-gray-200 hover:border-[#2d7a7a]"
          )}>
            <input type="file" id="file-upload" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <Upload className={cn("h-8 w-8 mx-auto mb-2", file ? "text-green-500" : "text-gray-400")} />
              <p className="text-sm font-medium text-gray-900">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 block">Visa Expiry Date</label>
          <Input type="date" value={visaExpiry} onChange={(e) => setVisaExpiry(e.target.value)} className={cn( "w-full h-11", validation.error && "border-red-500 focus-visible:ring-red-500 bg-red-50/30" )} />
            {validation.error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">
                  {validation.error}
                </p>
              </div>
            )}

          {!validation.error && visaExpiry && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              ✓ Date meets the 2-year validity requirement.
            </p>
          )}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!isValid} className={cn( "w-full h-12 text-white transition-all shadow-sm", isValid ? "bg-[#2d7a7a] hover:bg-[#1f5a5a]" : "bg-gray-300 cursor-not-allowed" )} >
        Continue
      </Button>
    </div>
  );
}