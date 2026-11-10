"use client";

import { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";

const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#111827",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626" },
  },
};

/** Wraps children in Stripe Elements, or explains what is missing when no key is configured. */
export function StripeProvider({ children }: { children: ReactNode }) {
  const stripe = getStripe();

  if (!stripe) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Card payments are not configured. Set{" "}
          <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> when building
          the frontend.
        </p>
      </div>
    );
  }

  return <Elements stripe={stripe}>{children}</Elements>;
}

export function CardField() {
  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-4 focus-within:border-teal-600">
      <CardElement options={CARD_OPTIONS} />
    </div>
  );
}

export interface CardResult {
  paymentMethodId?: string;
  error?: string;
}

/** Helpers that use the card typed into <CardField />. Must be used inside <StripeProvider />. */
export function useStripeCard() {
  const stripe = useStripe();
  const elements = useElements();

  const getCard = () => elements?.getElement(CardElement) ?? null;

  /** Saves the card for later off-session charges (installments) using a SetupIntent. */
  const saveCard = async (clientSecret: string, email?: string): Promise<CardResult> => {
    const card = getCard();
    if (!stripe || !card) return { error: "Card form is not ready yet." };

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card, billing_details: email ? { email } : {} },
    });
    if (result.error) return { error: result.error.message ?? "Card could not be saved." };

    const pm = result.setupIntent?.payment_method;
    const paymentMethodId = typeof pm === "string" ? pm : pm?.id;
    if (!paymentMethodId) return { error: "Stripe did not return a payment method." };
    return { paymentMethodId };
  };

  /** Creates a one-time payment method (used for pre-authorization holds). */
  const createPaymentMethod = async (email?: string): Promise<CardResult> => {
    const card = getCard();
    if (!stripe || !card) return { error: "Card form is not ready yet." };

    const result = await stripe.createPaymentMethod({
      type: "card",
      card,
      billing_details: email ? { email } : {},
    });
    if (result.error) return { error: result.error.message ?? "Card could not be read." };
    return { paymentMethodId: result.paymentMethod.id };
  };

  /** Completes extra authentication (3D Secure) when the bank asks for it. */
  const confirmPayment = async (clientSecret: string): Promise<{ error?: string }> => {
    if (!stripe) return { error: "Stripe is not ready yet." };
    const result = await stripe.confirmCardPayment(clientSecret);
    if (result.error) return { error: result.error.message ?? "Authentication failed." };
    return {};
  };

  return { ready: Boolean(stripe && elements), saveCard, createPaymentMethod, confirmPayment };
}
