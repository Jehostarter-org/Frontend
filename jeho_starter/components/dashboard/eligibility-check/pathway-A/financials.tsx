"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { useState, useCallback } from "react";
import { Upload, FileCheck, X, AlertCircle, Loader2, ShieldCheck } from "lucide-react";


const MAX_FILE_SIZE_MB = 15; 
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

interface StepFourFinancialProps {
  onNext: (data: { bankStatement: File }) => void;
}

export function StepFourFinancial({ onNext }: StepFourFinancialProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateStatement = (selectedFile: File): string | null => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) { return "Unsupported format. Please upload a PDF or Image (JPG/PNG)."; }
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) { return `File too large. Max size is ${MAX_FILE_SIZE_MB}MB.`; }
    return null;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      const validationError = validateStatement(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  }, []);

  const handleRemove = () => {
    setFile(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onNext({ bankStatement: file });
    } catch (err) {
      setError("Failed to process document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Step 3: Financial Verification</h2>
        <p className="text-xl text-gray-600">
          Upload a bank statement from the last 30-90 days. It must clearly show your name and consistent salary deposits.
        </p>
      </header>

      <div className="space-y-6">
        <div className="relative">
          <div className={cn( "border-2 border-dashed rounded-xl p-10 text-center transition-all group relative", file ? "border-green-500 bg-green-50/20" : 
          "border-gray-200 hover:border-[#2d7a7a] hover:bg-teal-50/30", error && "border-red-300 bg-red-50/30", isSubmitting && "opacity-60 pointer-events-none"
          )}>
            <input type="file" onChange={handleFileChange} accept={ALLOWED_EXTENSIONS.join(",")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={isSubmitting} />
        
            <div className="space-y-3 pointer-events-none">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                {file ? ( <FileCheck className="h-6 w-6 text-green-600" /> ) : ( 
                  <Upload className="h-6 w-6 text-gray-400 group-hover:text-[#2d7a7a]" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {file ? file.name : "Click to upload bank statement"}
                </p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                  PDF, JPG, PNG (Max {MAX_FILE_SIZE_MB}MB)
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 animate-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 bg-[#f8fafc] border border-gray-200 rounded-lg">
          <ShieldCheck className="h-5 w-5 text-[#2d7a7a] mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">Secure Verification</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              We only use your statement to verify eligibility. Your sensitive financial data is encrypted and never shared.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleSubmit} disabled={!file || isSubmitting} className={cn( "w-full h-12 text-white font-semibold transition-all shadow-md", file && !isSubmitting ? "bg-[#2d7a7a] hover:bg-[#1f5a5a]" : "bg-gray-200" )} >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying Document...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
          
          {file && !isSubmitting && (
            <button onClick={handleRemove} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1" >
              <X className="h-3 w-3" /> Remove and upload a different file
            </button>
          )}
        </div>
      </div>
    </div>
  );
}