"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Trash2, Plus } from "lucide-react";

interface ImageUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

export function ProductImageUploader({ value, onChange, error }: ImageUploaderProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = value.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const updatedFiles = [...value, ...files].slice(0, 5);
    onChange(updatedFiles);
  };

  const removeImage = (index: number) => {
    const updatedFiles = value.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-1">Product Images</h3>
        <p className="text-xs text-muted-foreground">First image is the cover. Max 5 images.</p>
      </div>

      <div className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 mb-4 flex items-center justify-center group hover:border-teal-500 transition-colors">
        {previewUrls.length > 0 ? (
          <>
            <Image src={previewUrls[0]} alt="Cover" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <Button variant="destructive" size="icon" onClick={() => removeImage(0)}>
                 <Trash2 className="w-5 h-5" />
               </Button>
            </div>
          </>
        ) : (
          <div className="text-center p-6 pointer-events-none">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium text-gray-600">Click to upload cover</p>
          </div>
        )}
        
        {previewUrls.length === 0 && (
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Upload cover image"
          />
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {previewUrls.slice(1).map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
            <Image src={url} alt={`Preview ${idx}`} fill className="object-cover" />
            <Button
              type="button"
              onClick={() => removeImage(idx + 1)}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {previewUrls.length < 5 && previewUrls.length > 0 && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors">
            <Plus className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] text-gray-500 font-medium mt-1">Add</span>
            <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" aria-label="Add more product images" />
          </label>
        )}
      </div>
      
      {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
    </Card>
  );
};
