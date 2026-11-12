"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Landmark, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DashboardShell from "@/components/dashboard/dashboard-layout.tsx";
import {
  useGetProviderConnectStatusQuery,
  useGetShopConnectStatusQuery,
  useStartProviderConnectMutation,
  useStartShopConnectMutation,
  type ConnectOnboardingResponse,
  type ConnectStatus,
} from "@/lib/api/servicePaymentsApiSlice";

function errorText(err: unknown, fallback: string): string {
  const data = (err as { data?: { detail?: string } | string })?.data;
  if (typeof data === "string") return data;
  return data?.detail || fallback;
}

interface SectionProps {
  title: string;
  description: string;
  status?: ConnectStatus;
  isLoading: boolean;
  error: unknown;
  isStarting: boolean;
  onStart: () => Promise<ConnectOnboardingResponse>;
  onRefresh: () => void;
}

function PayoutSection({
  title,
  description,
  status,
  isLoading,
  error,
  isStarting,
  onStart,
  onRefresh,
}: SectionProps) {
  const start = async () => {
    try {
      const res = await onStart();
      if (res.onboarding_url) {
        window.location.href = res.onboarding_url;
      } else {
        toast.error("Stripe did not return an onboarding link.");
      }
    } catch (err) {
      toast.error(errorText(err, "Could not start payout setup."));
    }
  };

  const ready = status?.connected && status.onboarding_completed && status.payouts_enabled;

  return (
    <Card className="space-y-4 rounded-2xl border-none p-6 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh status">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && <Loader2 className="h-6 w-6 animate-spin text-teal-600" />}

      {!isLoading && Boolean(error) && (
        <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-600">
          {errorText(error, "Not available for your account.")}
        </p>
      )}

      {!isLoading && !error && status && (
        <>
          <ul className="space-y-1.5 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-500">Stripe account</span>
              <span className="font-semibold">{status.connected ? "Created" : "Not set up"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Details submitted</span>
              <span className="font-semibold">{status.onboarding_completed ? "Yes" : "No"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Can receive payouts</span>
              <span className="font-semibold">{status.payouts_enabled ? "Yes" : "No"}</span>
            </li>
          </ul>

          {ready ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" /> You&apos;re ready to get paid.
            </p>
          ) : (
            <Button
              onClick={start}
              disabled={isStarting}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {status.connected ? "Continue payout setup" : "Set up payouts with Stripe"}
                </>
              )}
            </Button>
          )}
        </>
      )}
    </Card>
  );
}

function PayoutsContent() {
  // Coming back from Stripe (?connect=return|refresh): always re-read the status from Stripe.
  const returning = useSearchParams().get("connect");

  const shop = useGetShopConnectStatusQuery(undefined, { refetchOnMountOrArgChange: true });
  const provider = useGetProviderConnectStatusQuery(undefined, { refetchOnMountOrArgChange: true });
  const [startShop, shopStart] = useStartShopConnectMutation();
  const [startProvider, providerStart] = useStartProviderConnectMutation();

  return (
    <div className="space-y-6">
      {returning === "return" && (
        <p className="rounded-xl bg-teal-50 p-4 text-sm text-teal-800">
          Welcome back. We&apos;ve refreshed your payout status from Stripe.
        </p>
      )}
      {returning === "refresh" && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Your setup link expired. Press the button to get a new one.
        </p>
      )}

      <PayoutSection
        title="Seller payouts"
        description="Get paid for items sold in your shop."
        status={shop.data}
        isLoading={shop.isLoading}
        error={shop.error}
        isStarting={shopStart.isLoading}
        onStart={() => startShop().unwrap()}
        onRefresh={() => shop.refetch()}
      />

      <PayoutSection
        title="Driver & chaperone payouts"
        description="Get paid for airport pickups and chaperone jobs."
        status={provider.data}
        isLoading={provider.isLoading}
        error={provider.error}
        isStarting={providerStart.isLoading}
        onStart={() => startProvider().unwrap()}
        onRefresh={() => provider.refetch()}
      />
    </div>
  );
}

export default function PayoutsPage() {
  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="mb-6 text-sm text-gray-500">
            Connect a bank account through Stripe so your earnings can be paid out.
          </p>
          <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />}>
            <PayoutsContent />
          </Suspense>
        </div>
      </div>
    </DashboardShell>
  );
}
