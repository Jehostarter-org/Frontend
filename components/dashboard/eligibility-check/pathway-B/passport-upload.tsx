"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo, useCallback } from "react";
import { Upload, FileCheck, AlertCircle, Loader2, X, ShieldCheck } from "lucide-react";


const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

interface StepTwoPassportProps {
  onNext: (data: { passport: File; expiryDate: string }) => void;
}

export function StepTwoPassport({ onNext }: StepTwoPassportProps) {
  const [passport, setPassport] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dateValidation = useMemo(() => {
    if (!expiryDate) return { isEligible: false, error: null };
    const selected = new Date(expiryDate);
    const today = new Date();
    const minRequiredDate = new Date();
    minRequiredDate.setFullYear(today.getFullYear() + 2);

    const isTooSoon = selected < minRequiredDate;

    return {
      isEligible: !isTooSoon,
      error: isTooSoon 
        ? `Ineligible: Passport must be valid until at least ${minRequiredDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.` 
        : null
    };
  }, [expiryDate]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setFileError("Invalid format. Please use PDF, JPG, or PNG.");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`File is too large (Max ${MAX_FILE_SIZE_MB}MB).`);
        return;
      }
      setPassport(selectedFile);
    }
  }, []);

  const isValid = !!passport && dateValidation.isEligible && !fileError;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      onNext({ passport, expiryDate });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Step 1: Passport Verification</h2>
        <p className="text-gray-600">
          Upload a clear copy of your passport. To qualify for Gold Membership, your document must have at least 2 years of validity remaining.
        </p>
      </header>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Passport Photo</label>
          <div className={cn( "border-2 border-dashed rounded-xl p-10 text-center transition-all group relative", passport ? "border-green-500 bg-green-50/20" : 
            "border-gray-200 hover:border-[#2d7a7a] hover:bg-teal-50/30", fileError && "border-red-300 bg-red-50/30", isSubmitting && "opacity-50 pointer-events-none"
          )}>
            <input
              type="file"
              onChange={handleFileChange}
              accept={ALLOWED_EXTENSIONS.join(",")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isSubmitting}
            />
            <div className="space-y-2 pointer-events-none">
              {passport ? ( <FileCheck className="h-10 w-10 text-green-600 mx-auto" /> ) : (
                <Upload className="h-10 w-10 text-gray-400 mx-auto group-hover:text-[#2d7a7a]" />
              )}
              <p className="text-sm font-medium text-gray-900">
                {passport ? passport.name : "Click to upload passport"}
              </p>
              <p className="text-xs text-gray-500 font-normal tracking-wide">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          </div>
          {fileError && (
            <div className="flex items-center gap-2 text-red-600 text-xs font-medium animate-in slide-in-from-top-1">
              <AlertCircle className="h-3 w-3" /> <span>{fileError}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Passport Expiry Date</label>
          <Input 
            type="date" 
            value={expiryDate} 
            onChange={(e) => setExpiryDate(e.target.value)} 
            disabled={isSubmitting}
            className={cn(
              "h-12 w-full text-base",
              dateValidation.error && "border-red-500 focus-visible:ring-red-500 bg-red-50/30"
            )}
          />
          
          {dateValidation.error ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 animate-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium leading-relaxed">{dateValidation.error}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-teal-600" />
              Minimum 24 months validity required for pre-approval.
            </p>
          )}
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className={cn( "w-full h-12 text-white font-semibold transition-all shadow-md", isValid && !isSubmitting ? "bg-[#2d7a7a] hover:bg-[#1f5a5a]" : "bg-gray-200"
          )} >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying Document...
              </span>
            ) : (
              "Continue"
            )}
          </Button>

          {passport && !isSubmitting && (
            <button onClick={() => setPassport(null)} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1" >
              <X className="h-3 w-3" /> Remove and re-upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
}