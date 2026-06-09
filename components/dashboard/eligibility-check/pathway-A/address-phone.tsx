"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo, useCallback } from "react";
import { Upload, Phone, MapPin, FileCheck, X, AlertCircle } from "lucide-react";


const MAX_FILE_SIZE = 10 * 1024 * 1024; 
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

interface StepFiveAddressPhoneProps {
  onNext: (data: { addressProof: File; phoneNumber: string }) => void;
}

export function StepFiveAddressPhone({ onNext }: StepFiveAddressPhoneProps) {
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^\d+]/g, "");
    setPhoneNumber(filteredValue);
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError("File size exceeds 10MB limit.");
        return;
      }
      setAddressProof(file);
    }
  }, []);

  const isValid = useMemo(() => {
    const isPhoneValid = phoneNumber.length >= 10; 
    return !!addressProof && isPhoneValid && !fileError;
  }, [addressProof, phoneNumber, fileError]);

  const handleSubmit = () => {
    if (isValid && addressProof) {
      onNext({ addressProof, phoneNumber });
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 text-center md:text-left">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Step 4: Address & Phone Verification</h2>
        <p className="text-xl text-gray-600">
          Almost there! Please provide your residential address proof and local contact details.
        </p>
      </header>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#2d7a7a]">
            <MapPin className="h-4 w-4" />
            <label className="text-sm font-bold uppercase tracking-wider">Address Proof</label>
          </div>
          
          <p className="text-xs text-gray-500">
            Accepted: Utility bill, lease agreement, or bank document (dated within 3 months).
          </p>

          <div className={cn( "relative border-2 border-dashed rounded-xl p-8 text-center transition-all group", addressProof ? "border-green-500 bg-green-50/20" :
             "border-gray-200 hover:border-[#2d7a7a] hover:bg-teal-50/30", fileError && "border-red-300 bg-red-50/20"
          )}>
            <input id="address-upload" type="file" onChange={handleFileChange} accept={ALLOWED_EXTENSIONS.join(",")} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <div className="space-y-2 pointer-events-none">
              {addressProof ? ( <FileCheck className="h-10 w-10 text-green-600 mx-auto" /> ) : (
                <Upload className="h-10 w-10 text-gray-400 mx-auto group-hover:text-[#2d7a7a]" />
              )}
              <p className="text-sm font-medium text-gray-900">
                {addressProof ? addressProof.name : "Upload address document"}
              </p>
              <p className="text-xs text-gray-500 font-normal">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          </div>
          
          {fileError && (
            <div className="flex items-center gap-2 text-red-600 text-xs animate-in slide-in-from-top-1">
              <AlertCircle className="h-3 w-3" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#2d7a7a]">
            <Phone className="h-4 w-4" />
            <label className="text-sm font-bold uppercase tracking-wider text-gray-900">Local Phone Number</label>
          </div>
          
          <div className="relative">
            <Input type="tel" placeholder="+1 555 000 0000" value={phoneNumber} onChange={handlePhoneChange} 
              className={cn( "h-12 text-lg pl-4 transition-all", phoneNumber.length > 0 && phoneNumber.length < 10 ? "border-amber-300 bg-amber-50/20" : "focus:border-[#2d7a7a]" )}
            />
            <p className="mt-2 text-[11px] text-gray-500 italic">
              Numeric characters and "+" only. Alphabets are automatically blocked.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSubmit} disabled={!isValid} className={cn( "w-full h-14 text-white font-bold text-lg shadow-lg transition-all", isValid ? "bg-[#2d7a7a] hover:bg-[#1f5a5a] scale-[1.01]" : "bg-gray-200" )} >
            Complete Verification
          </Button>
          <p className="text-center text-[14px] text-teal-500 mt-4 px-8">
            By clicking "Complete Verification", you agree to our Terms of Service and data processing policies.
          </p>
        </div>
      </div>
    </div>
  );
}