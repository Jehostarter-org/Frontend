"use client";

import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { setCredentials } from "@/lib/features/auth/authSlice";
import { useVerifyPaymentQuery } from "@/lib/api/paymentsApiSlice";
import { useUpgradeToGoldPlanMutation } from "@/lib/api/plansApiSlice";

export default function VerifyPayment() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("session_id") ||
    searchParams.get("payment_id");
  const processedRef = useRef(false); 
  const [hasProcessed, setHasProcessed] = useState(false);

  const { data: verifyData, isLoading: isVerifying, isError: isVerifyError } = useVerifyPaymentQuery(reference, { skip: !reference });
  const [upgradeToGold, { isLoading: isUpgrading }] = useUpgradeToGoldPlanMutation();

  useEffect(() => {
    if (!reference || processedRef.current || hasProcessed) return;

    const processUpgrade = async () => {
      if (isVerifying || !verifyData) return;

      if (isVerifyError || verifyData.status !== "success") {
        toast.error("Payment verification failed.");
        router.push("/customer-details/packages");
        return;
      }

      try {
        processedRef.current = true;
        setHasProcessed(true);
        
        const upgradeResult = await upgradeToGold({
          plan: "gold",
          paymentReference: reference,
        }).unwrap();

        const userData = upgradeResult.user || upgradeResult;
        const token = upgradeResult.token || upgradeResult.accessToken;
        
        if (token) {
            dispatch(setCredentials({ user: userData, token }));
        }

        toast.success("Upgrade Successful!", { description: "Welcome to Gold." });
        router.push("/dashboard"); 

      } catch (error) {
        console.error("Upgrade failed:", error);
        toast.error("Payment successful but upgrade failed. Contact support.");
        router.push("/customer-details/packages");
      }
    };

    processUpgrade();
  }, [reference, verifyData, isVerifying, isVerifyError, router, dispatch, upgradeToGold, hasProcessed]);

  if (!reference) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <XCircle className="w-12 h-12 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-900">Invalid Payment Reference</h2>
        <p className="text-gray-500">Please check your payment link and try again.</p>
      </div>
    );
  }

  if (isVerifying || isUpgrading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-900">Verifying your payment...</h2>
        <p className="text-gray-500">Please do not close this window.</p>
      </div>
    );
  }

  if (isVerifyError || (verifyData && verifyData.status !== "success")) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <XCircle className="w-12 h-12 text-red-600" />
        <h2 className="text-xl font-semibold text-gray-900">Payment Verification Failed</h2>
        <p className="text-gray-500">We couldn't verify your payment. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
      <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
      <h2 className="text-xl font-semibold text-gray-900">Verifying your payment...</h2>
      <p className="text-gray-500">Please do not close this window.</p>
    </div>
  );
}
