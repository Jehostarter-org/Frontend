import { loadStripe, type Stripe } from "@stripe/stripe-js";

/**
 * Stripe.js loader. The publishable key is baked into the build through
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (see the Dockerfile build args).
 */
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

let stripePromise: Promise<Stripe | null> | null = null;

export const isStripeConfigured = (): boolean => publishableKey.startsWith("pk_");

export const getStripe = (): Promise<Stripe | null> | null => {
  if (!isStripeConfigured()) return null;
  if (!stripePromise) stripePromise = loadStripe(publishableKey);
  return stripePromise;
};
