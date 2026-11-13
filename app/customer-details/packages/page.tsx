"use client";

import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlanCard } from "@/components/plans/plan-card";
import { usePaymentInitialization } from "@/hooks/use-payment";
import { SUBSCRIPTION_PLANS, PlanType } from "@/lib/constants/plans";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useGetMyMembershipQuery } from "@/lib/api/plansApiSlice";
import { Button } from "@/components/ui/button";


export const dynamic = 'force-dynamic';

export default function PackageSelectionPage() {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanType | null>(null);
  const { isLoading, startPayment } = usePaymentInitialization();
  const {
    data: membership,
    isLoading: isMembershipLoading,
    isError: isMembershipError,
    refetch: refetchMembership,
  } = useGetMyMembershipQuery();
  const membershipExpiresAt = membership ? Date.parse(membership.expires_at) : NaN;
  const isActiveGoldMember =
    membership?.plan === "gold" &&
    membership.is_active &&
    Number.isFinite(membershipExpiresAt) &&
    membershipExpiresAt > Date.now();
  const isMembershipStatusUnavailable =
    isMembershipError ||
    (membership !== null &&
      membership !== undefined &&
      !Number.isFinite(membershipExpiresAt));

  const handleContinue = (planId: PlanType) => {
    if (planId === "gold") {
      if (isActiveGoldMember) return;
      if (isMembershipLoading || isMembershipStatusUnavailable) {
        toast.error("Membership status unavailable", {
          description: "Please verify your membership status before purchasing Gold.",
        });
        return;
      }

      startPayment();
      return;
    }

    if (planId === "regular") {
      toast.success("Regular Plan Selected", {
        description: "Redirecting to your dashboard...",
      });
      setTimeout(() => router.push("/dashboard"), 1000);
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

          {isMembershipStatusUnavailable && (
            <div role="alert" className="flex flex-col items-center gap-3 text-center text-sm text-red-700">
              <p>
                We couldn&apos;t confirm your membership status, so Gold checkout is unavailable.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetchMembership()}
                disabled={isMembershipLoading}
              >
                Retry membership check
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 items-stretch">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlanId === plan.id}
                isLoading={isLoading && plan.id === "gold" && selectedPlanId === "gold"}
                isCurrentPlan={plan.id === "gold" && isActiveGoldMember}
                isDisabled={plan.id === "gold" && (isMembershipLoading || isMembershipStatusUnavailable)}
                disabledLabel={isMembershipLoading ? "Checking membership..." : undefined}
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