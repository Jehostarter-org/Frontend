"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { useState, useCallback, useMemo } from "react";
import { Upload, FileCheck, FileText, AlertCircle, Loader2, X } from "lucide-react";


const MAX_FILE_SIZE_MB = 10;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

type MigrationType = "visa" | "invitation" | "migration";

interface StepThreeMigrationIntentProps {
  onNext: (data: { migrationIntent: File; type: MigrationType }) => void;
}

export function StepThreeMigrationIntent({ onNext }: StepThreeMigrationIntentProps) {
  const [migrationType, setMigrationType] = useState<MigrationType>("visa");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setError("Invalid format. Please upload PDF, JPG, or PNG.");
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File is too large (Max ${MAX_FILE_SIZE_MB}MB).`);
        return;
      }
      setFile(selectedFile);
    }
  }, []);

  const handleSubmit = async () => {
    if (!file || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      onNext({ migrationIntent: file, type: migrationType });
    } catch (err) {
      setError("Failed to process document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = !!file && !error;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Step 2: Proof of Migration Intent</h2>
        <p className="text-gray-600">
          Upload a document verifying your plans to relocate. This helps us grant your conditional pre-approval.
        </p>
      </header>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Select Document Type</label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: "visa", label: "Visa Grant Notice", desc: "Official visa approval from the destination country." },
              { id: "invitation", label: "Invitation Letter", desc: "Employment or family sponsorship letter." },
              { id: "migration", label: "Migration Documents", desc: "Flight bookings or official relocation records." },
            ].map((option) => (
              <button key={option.id} type="button" onClick={() => setMigrationType(option.id as MigrationType)}
                className={cn( "flex items-start gap-4 p-4 border-2 rounded-xl transition-all text-left", migrationType === option.id 
                    ? "border-[#2d7a7a] bg-teal-50/50 ring-1 ring-[#2d7a7a]" : "border-gray-100 hover:border-gray-200 bg-white"
                )}
              >
                <div className={cn( "mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors", migrationType === option.id ? "border-[#2d7a7a]" : "border-gray-300" )}>
                  {migrationType === option.id && <div className="w-2 h-2 rounded-full bg-[#2d7a7a]" />}
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", migrationType === option.id ? "text-teal-900" : "text-gray-900")}>
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">
            Upload {migrationType === 'visa' ? 'Visa Notice' : 'Document'}
          </label>
          <div className={cn( "border-2 border-dashed rounded-xl p-10 text-center transition-all group relative", file ? "border-green-500 bg-green-50/20" : 
            "border-gray-200 hover:border-[#2d7a7a] hover:bg-teal-50/30", error && "border-red-300 bg-red-50/30", isSubmitting && "opacity-50 pointer-events-none"
          )}>
            <input
              type="file"
              onChange={handleFileChange}
              accept={ALLOWED_EXTENSIONS.join(",")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isSubmitting}
            />
            <div className="space-y-3 pointer-events-none">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                {file ? <FileCheck className="h-6 w-6 text-green-600" /> : <Upload className="h-6 w-6 text-gray-400 group-hover:text-[#2d7a7a]" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                  PDF, JPG, PNG (Max {MAX_FILE_SIZE_MB}MB)
                </p>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 animate-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}
        </div>

        <div className="pt-4 space-y-3">
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}
            className={cn( "w-full h-14 text-white text-lg font-bold transition-all shadow-md",
              isValid && !isSubmitting ? "bg-[#2d7a7a] hover:bg-[#1f5a5a]" : "bg-gray-200"
          )}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Verifying Intent...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
          
          {file && !isSubmitting && (
            <button onClick={() => {setFile(null); setError(null);}} className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-1" >
              <X className="h-3 w-3" /> Change document
            </button>
          )}
        </div>
      </div>
    </div>
  );
}