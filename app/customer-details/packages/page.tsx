"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlanCard } from "@/components/plans/plan-card";
import { usePaymentInitialization } from "@/hooks/use-payment";
import { SUBSCRIPTION_PLANS, PlanType } from "@/lib/constants/plans";
import DashboardShell from "@/components/dashboard/dashboard-layout";


export const dynamic = 'force-dynamic';

export default function PackageSelectionPage() {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanType | null>(null);
  const { isLoading, startPayment } = usePaymentInitialization();

  const handleContinue = (planId: PlanType) => {
    if (planId === "regular") {
      toast.success("Regular Plan Selected", {
        description: "Redirecting to your dashboard...",
      });
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      startPayment();
    }
  };

  return (
    <DashboardShell>
      <div className=" bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Select Your Package
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              JehoStarter offers a seamless journey to your new life abroad.
              Choose the plan that best fits your ambitions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                isLoading={isLoading && plan.id === "gold" && selectedPlanId === "gold"}
                onSelect={(id) => setSelectedPlanId(id as PlanType)}
                onAction={() => handleContinue(plan.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}