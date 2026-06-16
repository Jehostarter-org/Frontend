"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { INITIAL_DATA, PropertyData } from "@/components/types/property-index";
import FormProgress from "@/components/dashboard/property-listing/form-progress";
import FeaturesStep from "@/components/dashboard/property-listing/owners-setup/features";
import BasicInfoStep from "@/components/dashboard/property-listing/owners-setup/basic-info";
import ReviewStep from "@/components/dashboard/property-listing/owners-setup/tenants-screaning";
import AvailabilityStep from "@/components/dashboard/property-listing/owners-setup/availability";
import { useUpdatePropertyMutation, usePublishPropertyMutation, useUploadImagesMutation } from "@/lib/api/propertyApiSlice";


export default function OwnerWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<PropertyData>>(INITIAL_DATA);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateProperty] = useUpdatePropertyMutation();
  const [publishProperty] = usePublishPropertyMutation();
  const [uploadImages] = useUploadImagesMutation();

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

  // Step 1 callback: capture the property ID from BasicInfoStep
  const handleStep1Complete = (data: Partial<PropertyData>, id?: string) => {
    updateFormData(data);
    if (id) setPropertyId(id);
    handleNext();
  };

  // Step 2 callback: update features + upload images to backend
  const handleStep2Complete = async (data: Partial<PropertyData>) => {
    updateFormData(data);

    if (!propertyId) {
      toast.error("Property ID missing. Please go back to Step 1.");
      return;
    }

    try {
      // 1. Update property features on backend (no images yet)
      await updateProperty({
        id: propertyId,
        body: {
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          amenities: data.amenities,
        },
      }).unwrap();

      // 2. Upload raw image files to backend storage
      const imageFiles = (data.images || []).filter((f): f is File => f instanceof File);
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));
        const result = await uploadImages({ id: propertyId, formData }).unwrap();
        setFormData((prev) => ({ ...prev, images: result.images }));
      }

      toast.success("Features & photos saved!");
      handleNext();
    } catch (error) {
      console.error("Failed to save features:", error);
      toast.error("Failed to save features. Please try again.");
    }
  };

  // Step 3 callback: update availability & pricing on backend
  // Note: AvailabilityStep sends OwnerStep3Values (flat fields), not nested PropertyData
  const handleStep3Complete = async (data: Record<string, any>) => {
    updateFormData(data);

    if (!propertyId) {
      toast.error("Property ID missing. Please go back to Step 1.");
      return;
    }

    try {
      await updateProperty({
        id: propertyId,
        body: {
          availableFrom: data.availableFrom,
          priceAmount: data.priceAmount,
          priceType: data.priceType,
          securityDeposit: data.securityDeposit,
          minStayDuration: data.minStayDuration,
          maxStayDuration: data.maxStayDuration,
          houseRules: data.houseRules,
        },
      }).unwrap();

      toast.success("Pricing & availability saved!");
      handleNext();
    } catch (error: any) {
      console.error("Failed to save availability:", error);
      if (error?.status) console.error("Status:", error.status, "Data:", error.data);
      if (error?.message) console.error("Message:", error.message);
      toast.error("Failed to save availability. Please try again.");
    }
  };

  // Step 4: publish the property
  const handleFinalSubmit = async () => {
    if (!propertyId) {
      toast.error("Property ID missing. Cannot publish.");
      return;
    }

    setIsSubmitting(true);
    try {
      await publishProperty(propertyId).unwrap();
      toast.success("Property listed successfully!");
      router.push("/dashboard/property-listing/success");
    } catch (error) {
      console.error("Failed to publish:", error);
      toast.error("Failed to publish property. Please try again.");
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
            <BasicInfoStep initialData={formData} onNext={handleStep1Complete} onBack={handleBack} />
          )}
          {step === 2 && (
            <FeaturesStep initialData={formData} onNext={handleStep2Complete} onBack={handleBack} />
          )}
          {step === 3 && (
            <AvailabilityStep initialData={formData} onNext={handleStep3Complete} onBack={handleBack} />
          )}
          {step === 4 && (
            <ReviewStep initialData={formData} isSubmitting={isSubmitting} onNext={handleFinalSubmit} onBack={handleBack} />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
