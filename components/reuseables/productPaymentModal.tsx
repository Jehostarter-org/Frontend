"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Wallet, Layers, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";

export function PaymentModal({ isOpen, onClose, product }: any) {
  const router = useRouter();
  const [method, setMethod] = useState("full");

  const installmentPrice = (product.price / 4).toFixed(2);

  // --- Dynamic Routing Logic ---
  const handleProceed = () => {
    // Define your paths here
    const path = method === "full" 
      ? `/dashboard/payment/`
      : `/dashboard/eligibility-check`
    
    router.push(path);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Payment Options</DialogTitle>
        </DialogHeader>

        <RadioGroup 
          value={method} 
          onValueChange={setMethod} 
          className="gap-4 py-6"
        >
          {/* Option 1: Full Payment */}
          <Label 
            htmlFor="full" 
            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              method === "full" ? "border-teal-600 bg-teal-50/50 shadow-sm" : "border-gray-100 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${method === "full" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Pay in Full</p>
                <p className="text-xs text-gray-500 font-medium">Instant ownership & confirmation</p>
              </div>
            </div>
            <RadioGroupItem value="full" id="full" className="sr-only" />
            {method === "full" && <CheckCircle2 className="h-5 w-5 text-teal-600 animate-in zoom-in" />}
          </Label>

          {/* Option 2: Installment */}
          <div className="space-y-3">
            <Label 
              htmlFor="installment" 
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                method === "installment" ? "border-teal-600 bg-teal-50/50 shadow-sm" : "border-gray-100 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${method === "installment" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Installmental Payment</p>
                  <p className="text-xs text-gray-500 font-medium">Split into 4 interest-free payments</p>
                </div>
              </div>
              <RadioGroupItem value="installment" id="installment" className="sr-only" />
              {method === "installment" && <CheckCircle2 className="h-5 w-5 text-teal-600 animate-in zoom-in" />}
            </Label>

            {/* Sub-text for Installment Selection */}
            {method === "installment" && (
              <div className="px-2 animate-in slide-in-from-top-2 duration-300">
                <Link 
                  href="/dashboard/eligibility-check" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Check your eligibility for credit first
                </Link>
              </div>
            )}
          </div>
        </RadioGroup>

        {/* Pricing Summary Card */}
        <Card className="bg-gray-50 border-gray-100 p-5 rounded-xl mb-6 shadow-inner">
          <div className="flex justify-between text-sm mb-3 font-medium text-gray-600">
            <span>Total Item Price</span>
            <span>${product.price}</span>
          </div>
          
          {method === "installment" && (
            <div className="flex justify-between items-center text-teal-700 border-t border-teal-100 pt-3">
              <span className="text-xs font-bold uppercase tracking-tight">First Installment (Due Now)</span>
              <span className="text-xl font-black">${installmentPrice}</span>
            </div>
          )}
        </Card>

        {/* Final Routing Action */}
        <Button 
          onClick={handleProceed}
          className="w-full bg-teal-600 hover:bg-teal-700 h-14 text-white font-bold text-lg rounded-xl shadow-lg transition-transform active:scale-[0.98]"
        >
          {method === "full" ? "Confirm & Pay Full" : "Proceed to Credit Setup"}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
          Secure encrypted payments processed by Paystack. Terms and conditions apply.
        </p>
      </DialogContent>
    </Dialog>
  );
}