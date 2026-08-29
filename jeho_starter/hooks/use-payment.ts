"use client";

import { toast } from "sonner";
import { useState } from "react";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useInitializePaymentMutation } from "@/lib/api/paymentsApiSlice";

export function usePaymentInitialization() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [initializePayment, { isLoading }] = useInitializePaymentMutation();

  const startPayment = async () => {
    if (!user?.email) {
      toast.error("Authentication required", {
        description: "Please log in to upgrade your plan.",
      });
      router.push("/auth/login");
      return;
    }

    try {
      // 2. Initialize Transaction on Backend
      // Expected response: { authorization_url: "https://checkout.paystack.com/...", reference: "..." }
      const response = await initializePayment({
        amount: 2500, // $25 USD
        email: user.email,
        plan: "gold",
        callback_url: `${window.location.origin}/payment/verify`,
      }).unwrap();

      const redirectUrl = response?.authorization_url || response?.data?.authorization_url;

      if (!redirectUrl) {
        throw new Error("No authorization URL returned from payment provider.");
      }

      toast.loading("Redirecting to secure payment gateway...");
      window.location.href = redirectUrl;

    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      toast.error(
        error?.data?.message || "Could not start payment. Please try again."
      );
    }
  };

  return {
    isLoading,
    startPayment,
  };
}