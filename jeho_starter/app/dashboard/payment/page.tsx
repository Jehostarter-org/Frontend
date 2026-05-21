"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, CreditCard, Wallet, ShieldCheck, Loader2, 
  Lock, CheckCircle2, ExternalLink 
} from "lucide-react";
import { toast } from "sonner";
import { useInitializePaymentMutation } from "@/lib/api/paymentsApiSlice";
import DashboardShell from "@/components/dashboard/dashboard-layout.tsx";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initializePayment, { isLoading }] = useInitializePaymentMutation();
  
  // Get product info from URL params (passed from product modal)
  const productId = searchParams.get("productId");
  const productName = searchParams.get("productName");
  const productPrice = searchParams.get("price");
  
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [email, setEmail] = useState("");

  const price = productPrice ? parseFloat(productPrice) : 0;

  const handlePayment = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const response = await initializePayment({
        email,
        amount: price * 100, // Convert to kobo/cents
        product_id: productId,
        callback_url: `${window.location.origin}/dashboard/payment/verify`,
      }).unwrap();

      if (response?.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url;
      } else {
        toast.success("Payment initialized successfully");
      }
    } catch (error) {
      toast.error("Failed to initialize payment. Please try again.");
    }
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-gray-100 rounded-full h-10 w-10" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Secure Checkout</h2>
              <p className="text-sm text-gray-500 font-medium">Complete your payment</p>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Summary */}
            <Card className="border-gray-100 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                  <div>
                    <p className="font-bold text-gray-900">{productName || "Product Purchase"}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {productId || "N/A"}</p>
                  </div>
                  <span className="text-xl font-black text-teal-600">${price.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-teal-600">${price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="border-gray-100 shadow-xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-700">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-white border-gray-200 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500">Receipt will be sent to this email</p>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-700">Payment Method</Label>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === "card" 
                        ? "border-teal-600 bg-teal-50/50 shadow-sm" 
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === "card" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Pay with Card</p>
                        <p className="text-xs text-gray-500">Visa, Mastercard, Verve</p>
                      </div>
                    </div>
                    {paymentMethod === "card" && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("transfer")}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      paymentMethod === "transfer" 
                        ? "border-teal-600 bg-teal-50/50 shadow-sm" 
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${paymentMethod === "transfer" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Bank Transfer</p>
                        <p className="text-xs text-gray-500">Direct bank transfer</p>
                      </div>
                    </div>
                    {paymentMethod === "transfer" && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                  </button>
                </div>

                {/* Pay Button */}
                <Button 
                  onClick={handlePayment}
                  disabled={isLoading || !email}
                  className="w-full py-7 text-lg font-bold rounded-2xl transition-all shadow-lg bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing...</>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Pay ${price.toFixed(2)}
                    </>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>Secured by Paystack. Your payment is encrypted.</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-gray-100 rounded-xl text-center">
            <p className="text-xs text-gray-500">
              By completing this payment, you agree to our{" "}
              <a href="#" className="text-teal-600 hover:underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-teal-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}