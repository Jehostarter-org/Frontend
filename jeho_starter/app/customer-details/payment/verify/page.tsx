import { Suspense } from "react";
import VerifyPayment from "@/components/payment/verify-payment";

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        <p className="text-gray-500">Please wait while we process your request.</p>
      </div>
    }>
      <VerifyPayment />
    </Suspense>
  );
}
