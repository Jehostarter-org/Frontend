"use client";

import { useForm } from "react-hook-form";
import { useState, useCallback, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UploadCloud, X, Home, Bath, Bed, AlertCircle, CheckCircle2 } from "lucide-react";

import FormSection from "../../form-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AMENITIES_LIST } from "@/lib/property-constant";
import { ownerStep2Schema, OwnerStep2Values } from "@/components/types/schemas/property-scehma";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

// --- Constants for Validation ---
const MAX_FILES = 10;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface OwnerStep2Props {
  onNext: (data: OwnerStep2Values) => void;
  onBack: () => void;
  initialData: Partial<OwnerStep2Values>;
}

export default function FeaturesStep({ onNext, onBack, initialData }: OwnerStep2Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<OwnerStep2Values>({
    resolver: zodResolver(ownerStep2Schema),
    defaultValues: {
      bedrooms: initialData.bedrooms?.toString() || "1",
      bathrooms: initialData.bathrooms?.toString() || "1",
      amenities: initialData.amenities || [],
      images: initialData.images || [],
    },
  });

  // --- Image Handling & Validation ---
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const currentFiles = form.getValues("images") || [];

    // 1. Check Total Count
    if (currentFiles.length + newFiles.length > MAX_FILES) {
      setUploadError(`Maximum ${MAX_FILES} photos allowed.`);
      return;
    }

    // 2. Validate Type and Size
    const validFiles: File[] = [];
    const invalidMessages: string[] = [];

    newFiles.forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        invalidMessages.push(`${file.name} is not a supported format.`);
      } else if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        invalidMessages.push(`${file.name} exceeds ${MAX_SIZE_MB}MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidMessages.length > 0) {
      setUploadError(invalidMessages[0]);
      return;
    }

    // 3. Update Form State and Previews
    form.setValue("images", [...currentFiles, ...validFiles], { shouldValidate: true });
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, [form]);

  const removeImage = (index: number) => {
    const currentFiles = form.getValues("images");
    const newFiles = currentFiles.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(previews[index]);
    
    form.setValue("images", newFiles, { shouldValidate: true });
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const onSubmit = (data: OwnerStep2Values) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center gap-4">
            <Button type="button" variant="ghost" onClick={onBack} className="h-10 w-10 p-0 rounded-full hover:bg-white hover:shadow-md">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Features & Media</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider italic">Highlight what makes your property unique</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-10">
            {/* --- Room Counts --- */}
            <FormSection title="Configuration" description="Specify the layout of the living space.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="bedrooms" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Bed className="w-4 h-4 text-teal-600" /> Bedrooms
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min={0} {...field} className="h-11 focus:ring-teal-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bathrooms" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Bath className="w-4 h-4 text-teal-600" /> Bathrooms
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" min={0} {...field} className="h-11 focus:ring-teal-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </FormSection>

            {/* --- Amenities Grid --- */}
            <FormSection title="Amenities" description="Select all features that add value to the tenant.">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AMENITIES_LIST.map((item) => (
                  <FormField key={item.id} control={form.control} name="amenities" render={({ field }) => {
                    const isChecked = field.value?.includes(item.id);
                    return (
                      <FormItem className={cn(
                        "flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 transition-all hover:bg-teal-50/20 cursor-pointer",
                        isChecked ? "border-teal-600 bg-teal-50/40 shadow-sm" : "border-gray-200"
                      )}>
                        <FormControl>
                          <Checkbox 
                            checked={isChecked} 
                            onCheckedChange={(checked) => {
                              return checked 
                                ? field.onChange([...(field.value || []), item.id]) 
                                : field.onChange(field.value?.filter((v) => v !== item.id));
                            }} 
                          />
                        </FormControl>
                        <FormLabel className="font-medium cursor-pointer flex-1 text-sm text-gray-700">
                          {item.label}
                        </FormLabel>
                        {isChecked && <CheckCircle2 className="h-4 w-4 text-teal-600 animate-in zoom-in" />}
                      </FormItem>
                    );
                  }} />
                ))}
              </div>
            </FormSection>

            {/* --- Photo Upload --- */}
            <FormSection title="Property Media" description="Visuals are key. Upload up to 10 high-resolution photos.">
              <div className="space-y-6">
                <div className={cn(
                  "border-2 border-dashed rounded-2xl transition-all relative overflow-hidden group",
                  uploadError || form.formState.errors.images ? "border-red-300 bg-red-50/10" : "border-gray-200 hover:border-teal-600 hover:bg-teal-50/20"
                )}>
                  <label className="flex flex-col items-center justify-center py-12 cursor-pointer w-full">
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud className="w-8 h-8 text-teal-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Click to upload photos</p>
                    <p className="text-xs text-gray-500 mt-2 font-medium italic">Supports JPG, PNG, WEBP (Max 5MB per file)</p>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                {/* Error Messaging */}
                {(uploadError || form.formState.errors.images) && (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-semibold animate-in slide-in-from-left-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{uploadError || form.formState.errors.images?.message}</span>
                  </div>
                )}

                {/* Previews Grid */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {previews.map((src, index) => (
                      <div key={src} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-in zoom-in-95">
                        <img src={src} alt="Upload preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Button 
                          type="button" 
                          onClick={() => removeImage(index)} 
                          className="absolute top-2 right-2 h-7 w-7 p-0 bg-white/90 hover:bg-red-600 hover:text-white rounded-full shadow-lg transition-all"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormSection>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <Button type="button" variant="outline" onClick={onBack} className="text-gray-900 border-teal-500 px-12 h-12 hover:bg-gray-100">
            Back
          </Button>
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-12 h-12 font-bold shadow-lg transition-all active:scale-95">
            Continue to Pricing
          </Button>
        </div>
      </form>
    </Form>
  );
}