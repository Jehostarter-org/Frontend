"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { INITIAL_DATA, PropertyData } from "@/components/types/property-index";
import FormProgress from "@/components/dashboard/property-listing/form-progress";
import FeaturesStep from "@/components/dashboard/property-listing/owners-setup/features";
import BasicInfoStep from "@/components/dashboard/property-listing/owners-setup/basic-info"
import ReviewStep from "@/components/dashboard/property-listing/owners-setup/tenants-screaning";
import AvailabilityStep from "@/components/dashboard/property-listing/owners-setup/availability";


export default function OwnerWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<PropertyData>>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateFormData = (newData: Partial<PropertyData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.back();
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      console.log("Submitting Property:", formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Property listed successfully!");
      router.push("/dashboard/property-listing/success");
    } catch (error) {
      console.error(error);
      toast.error("Failed to list property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <div className="text-center ">
          <h1 className="text-3xl mb-3 font-bold text-gray-900">List Your Property</h1>
          <p className="font-normal text-gray-500">Share details about your apartment to find the perfect tenant.</p>
        </div>

        <FormProgress currentStep={step} totalSteps={4} labels={["Basic Info", "Features", "Availability", "Review"]} />

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {step === 1 && (
            <BasicInfoStep initialData={formData} onNext={(data) => { updateFormData(data); handleNext(); }} onBack={handleBack} />
          )}
          {step === 2 && (
            <FeaturesStep initialData={formData} onNext={(data) => { updateFormData(data); handleNext(); }} onBack={handleBack} />
          )}
          {step === 3 && (
            <AvailabilityStep initialData={formData} onNext={(data) => { updateFormData(data); handleNext(); }} onBack={handleBack} />
          )}
          {step === 4 && (
            <ReviewStep initialData={formData} isSubmitting={isSubmitting} onNext={handleFinalSubmit} onBack={handleBack} />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
