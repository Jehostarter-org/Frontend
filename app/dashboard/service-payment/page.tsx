"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardShell from "@/components/dashboard/dashboard-layout.tsx";
import { useAuth } from "@/components/contexts/auth-context";
import { useCurrency } from "@/components/contexts/currencyContext";
import { CardField, StripeProvider, useStripeCard } from "@/components/payment/stripe-card";
import {
  useAuthorizeServiceHoldMutation,
  useCancelServiceRequestMutation,
  useGetServiceRequestSummaryQuery,
} from "@/lib/api/servicePaymentsApiSlice";

const DEFAULT_NEXT = "/dashboard";

function errorText(err: unknown, fallback: string): string {
  const data = (err as { data?: { detail?: string; message?: string } | string })?.data;
  if (typeof data === "string") return data;
  return data?.detail || data?.message || fallback;
}

/** Only allow redirects to pages inside this app. */
function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : DEFAULT_NEXT;
}

function HoldForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { ready, createPaymentMethod, confirmPayment } = useStripeCard();

  const serviceId = params.get("id") ?? "";
  const next = safeNext(params.get("next"));

  const { data: service, isLoading } = useGetServiceRequestSummaryQuery(serviceId, {
    skip: !serviceId,
  });
  const [authorizeHold] = useAuthorizeServiceHoldMutation();
  const [cancelService, { isLoading: cancelling }] = useCancelServiceRequestMutation();

  const [busy, setBusy] = useState(false);
  const [held, setHeld] = useState(false);

  const amount = service?.price ? parseFloat(service.price) : 0;
  const currency = service?.currency || "USD";

  const handleAuthorize = async () => {
    setBusy(true);
    try {
      const pm = await createPaymentMethod(user?.email);
      if (pm.error || !pm.paymentMethodId) {
        toast.error(pm.error ?? "Card could not be read.");
        return;
      }

      const res = await authorizeHold({
        serviceId,
        payment_method_id: pm.paymentMethodId,
        amount,
        currency,
      }).unwrap();

      // The bank may ask for extra confirmation (3D Secure)
      const holdStatus = res.hold?.status;
      const secret = res.client_secret || res.hold?.client_secret;
      if (secret && (holdStatus === "pending" || holdStatus === "requires_action")) {
        const confirmed = await confirmPayment(secret);
        if (confirmed.error) {
          toast.error(confirmed.error);
          return;
        }
      }

      setHeld(true);
    } catch (err) {
      toast.error(errorText(err, "Could not place the hold. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelService({ serviceId, reason: "Cancelled by customer" }).unwrap();
      toast.success("Request cancelled and the hold released.");
      router.push(DEFAULT_NEXT);
    } catch (err) {
      toast.error(errorText(err, "Could not cancel the request."));
    }
  };

  if (!serviceId) {
    return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">No service request selected.</p>;
  }
  if (isLoading) return <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />;

  if (held) {
    return (
      <Card className="rounded-2xl border-none shadow-xl">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle2 className="h-14 w-14 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">Payment secured</h2>
          <p className="max-w-md text-sm text-gray-600">
            {formatPrice(amount, currency)} is held on your card. You are only charged when the
            service is completed, and the hold is released if it is cancelled.
          </p>
          <Button onClick={() => router.push(next)} className="bg-teal-600 hover:bg-teal-700">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Secure your booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Service</span>
            <span className="font-semibold capitalize">
              {(service?.service_type ?? "service").replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="font-semibold text-gray-700">Amount to hold</span>
            <span className="text-lg font-black text-teal-700">
              {amount > 0 ? formatPrice(amount, currency) : "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      {amount > 0 ? (
        <Card className="rounded-2xl border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" /> Card details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardField />
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="h-3.5 w-3.5" />
              We only reserve the amount now. You are charged when the service is completed.
            </p>
            <Button
              onClick={handleAuthorize}
              disabled={busy || !ready}
              className="h-12 w-full bg-teal-600 text-base font-bold hover:bg-teal-700"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize hold"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          This request has no price yet, so there is nothing to hold.
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <button onClick={() => router.push(next)} className="font-semibold text-gray-500 underline">
          Skip for now
        </button>
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="font-semibold text-red-600 underline"
        >
          Cancel this request
        </button>
      </div>

      <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-4 w-4" /> Secured by Stripe.
      </p>
    </div>
  );
}

export default function ServicePaymentPage() {
  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Payment</h1>
          <StripeProvider>
            <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />}>
              <HoldForm />
            </Suspense>
          </StripeProvider>
        </div>
      </div>
    </DashboardShell>
  );
}
