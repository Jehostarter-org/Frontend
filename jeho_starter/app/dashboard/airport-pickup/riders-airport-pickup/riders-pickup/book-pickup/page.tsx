"use client";

import { useRouter } from "next/navigation";
import StepOneForm, { StepOneData } from "./step_one_form";

export default function Page() {
  const router = useRouter();

  const handleNext = (data: StepOneData) => {
    console.log("Step 1 Data Captured:", data);
    router.push("/dashboard/airport-pickup/riders-pickup/step-two");
  };

  const handleBack = () => {
    router.back();
  };

  return <StepOneForm onNext={handleNext} onBack={handleBack} />;
}