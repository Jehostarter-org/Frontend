"use client";

import React from "react";
import FormSection from "../../form-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/contexts/auth-context";
import { PropertyData } from "@/components/types/property-index";
import { ArrowLeft, CheckCircle2, FileText, Loader2, MapPin } from "lucide-react";



interface OwnerStep4Props {
  onNext: (data: Partial<PropertyData>) => void; 
  onBack: () => void;
  initialData: Partial<PropertyData>;
  isSubmitting?: boolean; 
}

const SummaryItem = ({ label, value, className = "" }: { label: string, value?: string | number | null, className?: string }) => (
  <div className={className}>
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">{label}</span>
    <p className="text-sm font-semibold text-gray-900 break-words">
      {value || <span className="text-gray-400 italic">Not specified</span>}
    </p>
  </div>
);

export default function ReviewStep({ onNext, onBack, initialData, isSubmitting = false }: OwnerStep4Props) {
  const { user } = useAuth();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(initialData); 
  };

  const formatPrice = (price?: number, currency = "AUD") => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg h-auto">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Listing</h2>
            <p className="text-sm text-gray-600 mt-1">Step 4 of 4 - Final Confirmation</p>
          </div>
        </div>

        <FormSection title="Property Details">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{initialData.propertyTitle || "Untitled Property"}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  {initialData.city || "Unknown City"}, {initialData.state || "State"}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="block text-xl font-bold text-teal-700">
                  {formatPrice(initialData.pricing?.amount, initialData.pricing?.currency)}
                </span>
                <span className="text-xs text-gray-500 font-medium uppercase">
                  Per {initialData.pricing?.frequency || "Month"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <SummaryItem label="Property Type" value={initialData.propertyType} />
              <SummaryItem label="Bedrooms" value={initialData.bedrooms} />
              <SummaryItem label="Bathrooms" value={initialData.bathrooms} />
              <SummaryItem label="Furnished" value={initialData.furnished ? "Yes" : "No"} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-gray-100">
               <SummaryItem label="Available From" value={initialData.availableFrom} />
               <SummaryItem label="Min Stay" value={`${initialData.minStayDuration || 1} Months`} />
               <SummaryItem label="Security Deposit" value={initialData.pricing?.securityDeposit ? "Required" : "None"} />
            </div>

            {initialData.amenities && initialData.amenities.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-3">Amenities Included</span>
                <div className="flex flex-wrap gap-2">
                  {initialData.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Tenant Screening Preview">
           <div className="p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50/50">
              <div className="flex items-start gap-4">
                 <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <FileText className="w-6 h-6 text-blue-600" />
                 </div>
                 <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-gray-900">Standard Application Form</h4>
                    <p className="text-xs text-gray-500">
                        This is the automated screening form tenants will see when applying for your
                        <span className="font-medium text-gray-700"> {initialData.propertyTitle}</span>.
                    </p>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4 text-xs opacity-70">
                        <div className="bg-white p-2 rounded border">
                            <span className="block text-gray-400">Applicant Name</span>
                            <span className="font-mono">{user?.firstName} {user?.lastName}</span>
                        </div>
                        <div className="bg-white p-2 rounded border">
                            <span className="block text-gray-400">Employment Status</span>
                            <span className="font-mono">Employed</span>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </FormSection>
      </div>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="px-6" >
            Back
        </Button>
        <Button type="submit" disabled={isSubmitting} className="px-8 bg-teal-600 hover:bg-teal-700 text-white min-w-[140px]" >
            {isSubmitting ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...
                </>
            ) : (
                "Publish Listing"
            )}
        </Button>
      </div>
    </form>
  );
}
