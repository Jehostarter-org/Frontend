"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardShell from "@/components/dashboard/dashboard-layout.tsx";
import { useAuth } from "@/components/contexts/auth-context";
import { useCurrency } from "@/components/contexts/currencyContext";
import { CardField, StripeProvider, useStripeCard } from "@/components/payment/stripe-card";
import {
  useAttachOrderPaymentMethodMutation,
  useCreateOrderMutation,
} from "@/lib/api/ordersApiSlice";

type Plan = "full" | "weekly" | "monthly";

const PLAN_CONFIG: Record<Plan, { label: string; splits: number; period: string }> = {
  full: { label: "Pay in full", splits: 1, period: "once" },
  weekly: { label: "Weekly payment", splits: 4, period: "week" },
  monthly: { label: "Monthly payment", splits: 3, period: "month" },
};

function errorText(err: unknown, fallback: string): string {
  const data = (err as { data?: { detail?: string; message?: string } | string })?.data;
  if (typeof data === "string") return data;
  return data?.detail || data?.message || fallback;
}

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { ready, saveCard } = useStripeCard();

  const [createOrder] = useCreateOrderMutation();
  const [attachPaymentMethod] = useAttachOrderPaymentMethodMutation();

  const productId = params.get("productId") ?? "";
  const productName = params.get("productName") ?? "Product";
  const price = parseFloat(params.get("price") ?? "0") || 0;
  const currency = params.get("currency") ?? "USD";
  const rawPlan = params.get("plan");
  const plan: Plan = rawPlan === "weekly" || rawPlan === "monthly" ? rawPlan : "full";
  const cfg = PLAN_CONFIG[plan];

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { full: boolean; message: string }>(null);

  const perPayment = cfg.splits > 0 ? price / cfg.splits : price;
  const isInstallment = plan !== "full";

  const handlePay = async () => {
    if (!productId || price <= 0) {
      toast.error("This product could not be found. Please go back and try again.");
      return;
    }
    setBusy(true);
    try {
      // 1. Create the order (backend also creates a SetupIntent for the card)
      const created = await createOrder({
        listing_id: productId,
        payment_type: isInstallment ? "installment" : "full",
        installments_count: cfg.splits,
        interval: plan === "weekly" ? "weekly" : "monthly",
      }).unwrap();

      const secret = created.client_secret;
      if (!secret || secret.includes("mock")) {
        toast.error("The payment service could not prepare your card. Please try again later.");
        return;
      }

      // 2. Save the card with Stripe
      const saved = await saveCard(secret, user?.email);
      if (saved.error || !saved.paymentMethodId) {
        toast.error(saved.error ?? "Card could not be saved.");
        return;
      }

      // 3. Attach it to the order. A full payment is charged right here;
      //    an installment order waits for admin approval before the first charge.
      const attached = await attachPaymentMethod({
        orderId: created.order.id,
        payment_method_id: saved.paymentMethodId,
        customer_id: created.customer_id || undefined,
      }).unwrap();

      setDone({
        full: !isInstallment,
        message: attached.message,
      });
    } catch (err) {
      toast.error(errorText(err, "Payment failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Card className="rounded-2xl border-none shadow-xl">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <CheckCircle2 className="h-14 w-14 text-teal-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {done.full ? "Payment successful" : "Order submitted"}
          </h2>
          <p className="max-w-md text-sm text-gray-600">
            {done.full
              ? `You paid ${formatPrice(price, currency)} for ${productName}.`
              : `Your card is saved. Once your order is approved, the first payment of ${formatPrice(
                  perPayment,
                  currency
                )} is charged automatically.`}
          </p>
          <Button
            onClick={() => router.push("/dashboard/orders")}
            className="bg-teal-600 hover:bg-teal-700"
          >
            View my orders
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Item</span>
            <span className="font-semibold text-gray-900">{productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Plan</span>
            <span className="font-semibold text-gray-900">{cfg.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total</span>
            <span className="font-semibold text-gray-900">{formatPrice(price, currency)}</span>
          </div>
          {isInstallment && (
            <div className="flex justify-between border-t pt-3 text-teal-700">
              <span className="font-semibold">
                {cfg.splits} payments of
              </span>
              <span className="text-lg font-black">{formatPrice(perPayment, currency)}</span>
            </div>
          )}
        </CardContent>
      </Card>

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
            {isInstallment
              ? "Your card is saved securely with Stripe and charged for each installment."
              : "Your card is charged securely by Stripe."}
          </p>
          <Button
            onClick={handlePay}
            disabled={busy || !ready}
            className="h-12 w-full bg-teal-600 text-base font-bold hover:bg-teal-700"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isInstallment ? (
              "Save card & place order"
            ) : (
              `Pay ${formatPrice(price, currency)}`
            )}
          </Button>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="h-4 w-4" /> Secured by Stripe. Your card details never touch our servers.
      </p>
    </div>
  );
}

export default function PaymentPage() {
  const router = useRouter();

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <header className="mb-8 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <Link href="/dashboard/orders" className="text-xs font-semibold text-teal-600">
                My orders
              </Link>
            </div>
          </header>

          <StripeProvider>
            <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />}>
              <CheckoutForm />
            </Suspense>
          </StripeProvider>
        </div>
      </div>
    </DashboardShell>
  );
}
