"use client";

import { ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StepOnePathwaySelection } from "./page";
import { EligibilityResult } from "./eligibility-result";
import { StepFourFinancial } from "./pathway-A/financials";
import { StepThreeEmployment } from "./pathway-A/employments";
import { StepTwoPassport } from "./pathway-B/passport-upload";
import { StepFiveAddressPhone } from "./pathway-A/address-phone";
import { StepThreeMigrationIntent } from "./pathway-B/migration-intent";
import { StepTwoVisaVerification } from "./pathway-A/visa-verification";
import { StepFourDestinationContact } from "./pathway-B/destination-content";
import { useCheckGoldEligibilityDestinationMutation } from "@/lib/api/plansApiSlice";



type Pathway = "a" | "b" | null

const STEPS_CONFIG = {
  a: ["selection", "pathway-a-2", "pathway-a-3", "pathway-a-4", "pathway-a-5", "result"],
  b: ["selection", "pathway-b-2", "pathway-b-3", "pathway-b-4", "result"],
} as const;

export function EligibilityForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<String>("selection")
  const [formData, setFormData] = useState<{ pathway: Pathway }>({ pathway: null });
 
  const [checkEligibilityStatus] = useCheckGoldEligibilityDestinationMutation();

  const steps = useMemo(() => {
    return formData.pathway ? STEPS_CONFIG[formData.pathway] : STEPS_CONFIG.a;
  }, [formData.pathway]);

  const currentIndex = steps.indexOf(currentStep as any);

  const handleNext = (data?: any) => {
    if (data) setFormData((prev) => ({ ...prev, ...data }));
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      const nextStep = steps[nextIndex];
      setCurrentStep(nextStep);
      if (nextStep === "result") checkEligibilityStatus(undefined);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) { setCurrentStep(steps[currentIndex - 1]);
    } else { router.back(); }
  };

 const handleSelectPathway = (pathway: Pathway) => {
    setFormData({ pathway });
    setCurrentStep(pathway === "a" ? "pathway-a-2" : "pathway-b-2");
  };

  const progress = Math.round((currentIndex / (steps.length - 1)) * 100);

  const renderStep = () => {
    switch (currentStep) {
      case "selection":   return <StepOnePathwaySelection onSelectPathway={handleSelectPathway} />;
      case "pathway-a-2": return <StepTwoVisaVerification onNext={handleNext} />;
      case "pathway-a-3": return <StepThreeEmployment onNext={handleNext} />;
      case "pathway-a-4": return <StepFourFinancial onNext={handleNext} />;
      case "pathway-a-5": return <StepFiveAddressPhone onNext={handleNext} />;
      case "pathway-b-2": return <StepTwoPassport onNext={handleNext} />;
      case "pathway-b-3": return <StepThreeMigrationIntent onNext={handleNext} />;
      case "pathway-b-4": return <StepFourDestinationContact onNext={handleNext} />;
      case "result":      return <EligibilityResult pathway={formData.pathway} />;
      default:            return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      {currentStep !== "selection" && (
        <div className="py-1">
          <Button variant="ghost" className="mb-1 md:-ml-60 bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => handleBack()} >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      )}


      <div className="text space-y-4 text-center">
        <h1 className="md:text-4xl text-3xl mb-5 font-bold text-teal-700">Gold Membership Eligibility</h1>  
        {currentStep !== "selection" && currentStep !== "result" && (
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm font-semibold text-teal-900">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-teal-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-5 lg:p-8">
        {renderStep()}
      </div>
    </div>
  )
}