"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import React, { useState, useCallback, useMemo } from "react";
import { Upload, FileText, X, FileWarning, Loader2 } from "lucide-react";


const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

interface StepThreeEmploymentProps {
  onNext: (data: { payslips: File[] }) => void;
  minFiles?: number;
}

export function StepThreeEmployment({ onNext, minFiles = 2 }: StepThreeEmploymentProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `"${file.name}" format not supported. Use PDF, JPG, or PNG.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
    }
    return null;
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files) {
      const incomingFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      
      for (const file of incomingFiles) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return; 
        }
        validFiles.push(file);
      }

      setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) setError(null);
  };

  const { isValid, progressLabel } = useMemo(() => {
    const count = files.length;
    const ready = count >= minFiles;
    return { isValid: ready, progressLabel: ready ? "Requirement met" : `Upload ${minFiles - count} more` };
  }, [files, minFiles]);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      await onNext({ payslips: files });
    } catch (err) {
      setError("An error occurred while processing files. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Step 2: Employment Proof</h2>
        <p className="text-xl text-gray-600"> Please upload your {minFiles} most recent payslips. </p>
      </header>

      <div className="space-y-6">
        <div className="relative">
          <div className={cn( "border-2 border-dashed rounded-xl p-10 text-center transition-all group relative", error ? "border-red-300 bg-red-50/30" : 
            isValid ? "border-green-500 bg-green-50/20" : "border-gray-200 hover:border-[#2d7a7a] hover:bg-teal-50/30", isSubmitting && "opacity-50 pointer-events-none"
          )}>
            <input type="file" onChange={handleFileChange} accept={ALLOWED_EXTENSIONS.join(",")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" multiple disabled={isSubmitting}
            />
            <div className="space-y-2">
              <Upload className={cn( "h-10 w-10 mx-auto mb-2 transition-colors", error ? "text-red-400" : "text-gray-400 group-hover:text-[#2d7a7a]" )} />
              <p className="text-sm font-medium text-gray-900">
                {error ? "Upload failed" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500 font-normal">PDF, JPG, PNG (Max 10MB)</p>
            </div>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 animate-in slide-in-from-top-2">
              <FileWarning className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Files</h3>
              <span className={cn("text-xs font-bold", isValid ? "text-green-600" : "text-amber-600")}>
                {progressLabel}
              </span>
            </div>
            
            <div className="grid gap-2">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <FileText className="h-5 w-5 text-[#2d7a7a]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  {!isSubmitting && (
                    <Button onClick={() => removeFile(index)} className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors" >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} className={cn( "w-full h-12 text-white transition-all shadow-md", isValid && !isSubmitting ? "bg-[#2d7a7a] hover:bg-[#1f5a5a]" : "bg-gray-200" )} >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing Files...
            </span>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
}