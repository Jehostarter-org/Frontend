// PropertyOnboarding.tsx - Parent component

"use client";

import { useState } from "react";
import BasicInfoStep from "./steps/basic-info";
import FeaturesStep from "./steps/features";
import AvailabilityStep from "./steps/availability";
import ReviewStep from "./steps/tenants-screaning";
import { propertyApi } from "@/lib/api/propertyApi";

type Step = 1 | 2 | 3 | 4;

export default function PropertyOnboarding() {
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [propertyId, setPropertyId] = useState<string>();
    const [formData, setFormData] = useState({
        // Step 1
        propertyTitle: "",
        propertyType: "",
        rentalType: "",
        description: "",
        address: "",
        nearestLandmark: "",
        city: "",
        state: "",
        // Step 2
        bedrooms: "1",
        bathrooms: "1",
        amenities: [],
        images: [],
        // Step 3
        availableFrom: "",
        priceAmount: "",
        priceType: "monthly",
        securityDeposit: false,
        minStayDuration: "1",
        maxStayDuration: "",
        houseRules: [],
    });

    const handleStep1Next = async (data: any, id?: string) => {
        setFormData(prev => ({ ...prev, ...data }));
        if (id) setPropertyId(id);
        setCurrentStep(2);
    };

    const handleStep2Next = async (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));

        // Update property with step 2 data
        if (propertyId) {
            await propertyApi.updateProperty(propertyId, data);
        }
        setCurrentStep(3);
    };

    const handleStep3Next = async (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));

        // Update property with step 3 data
        if (propertyId) {
            await propertyApi.updateProperty(propertyId, data);
        }
        setCurrentStep(4);
    };

    const handlePublish = async () => {
        if (propertyId) {
            await propertyApi.publishProperty(propertyId);
            // Redirect to success page or property listing
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {currentStep === 1 && (
                <BasicInfoStep
                    onNext={handleStep1Next}
                    onBack={() => {/* handle back */ }}
                    initialData={formData}
                    propertyId={propertyId}
                />
            )}
            {currentStep === 2 && (
                <FeaturesStep
                    onNext={handleStep2Next}
                    onBack={() => setCurrentStep(1)}
                    initialData={formData}
                    propertyId={propertyId}
                />
            )}
            {currentStep === 3 && (
                <AvailabilityStep
                    onNext={handleStep3Next}
                    onBack={() => setCurrentStep(2)}
                    initialData={formData}
                    propertyId={propertyId}
                />
            )}
            {currentStep === 4 && (
                <ReviewStep
                    onNext={handlePublish}
                    onBack={() => setCurrentStep(3)}
                    initialData={formData}
                    isSubmitting={false}
                />
            )}
        </div>
    );
}