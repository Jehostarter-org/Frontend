"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useCheckGoldEligibilityDestinationMutation, useCheckGoldEligibilityHomeMutation } from "@/lib/api/plansApiSlice";


interface EligibilityResultProps {
  pathway?: "a" | "b" | null;
  formData?: any;
}

export function EligibilityResult({ pathway }: EligibilityResultProps) {
  const [checkDestination, { data: destData, isLoading: destLoading, error: destError }] = useCheckGoldEligibilityDestinationMutation();
  const [checkHome, { data: homeData, isLoading: homeLoading, error: homeError }] = useCheckGoldEligibilityHomeMutation();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!pathway || hasTriggered.current) return;
    
    const triggerVerification = async () => {
      hasTriggered.current = true;
      try {
        if (pathway === "a") {
          await checkDestination({}).unwrap();
        } else if (pathway === "b") {
          await checkHome({}).unwrap();
        }
      } catch (err) {
        console.error("Verification POST failed:", err);
      }
    };
    triggerVerification();
  }, [pathway, checkDestination, checkHome]);

  const isLoading = destLoading || homeLoading;
  const error = destError || homeError;

  const eligibilityStatus = useMemo(() => {
    if (isLoading || !hasTriggered.current) return "processing";
    const status = pathway === "a" ? destData?.status : homeData?.status;
    if (status === "approved") return "approved";
    if (status === "conditionally-approved" || (pathway === "b" && status === "approved")) { return "conditionally-approved"; }
    if (status === "rejected") return "rejected";
    return "processing";
  }, [destData, homeData, pathway, isLoading]);

  // const statusConfig = {
  //   processing: {
  //     icon: <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2d7a7a] mx-auto" />,
  //     title: "Checking Status...",
  //     description: "We are verifying your documents against our eligibility criteria. This usually takes a few moments.",
  //     benefitsTitle: "",
  //     benefits: undefined as string[] | undefined,
  //     containerClass: "bg-gray-50 border-gray-200",
  //     buttonText: "Return to Dashboard",
  //   },
  //   approved: {
  //     icon: <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />,
  //     title: "Congratulations!",
  //     description: "You have been approved for Gold Membership. You can now access instalment payment services for furniture, electronics, and more.",
  //     benefitsTitle: "Your Gold Membership Benefits:",
  //     benefits: ["Furniture & Appliances", "Vehicle Financing", "Electronics Purchases", "Relocation Credit", "Priority Support"],
  //     containerClass: "bg-green-50 border-green-200 text-green-800",
  //     buttonText: "Go to Dashboard",
  //   },
  //   "conditionally-approved": {
  //     icon: <Clock className="h-16 w-16 text-blue-500 mx-auto" />,
  //     title: "Conditionally Approved",
  //     description: "Your pre-eligibility has been approved! Full benefits unlock once you arrive in your destination and complete final verification.",
  //     benefitsTitle: "Next Steps Upon Arrival:",
  //     benefits: ["Verify local phone (OTP)", "Upload 2 recent payslips", "Submit local bank statement", "Final Visa confirmation"],
  //     containerClass: "bg-blue-50 border-blue-200 text-blue-800",
  //     buttonText: "View Pre-Approval",
  //   },
  //   rejected: {
  //     icon: <XCircle className="h-16 w-16 text-red-500 mx-auto" />,
  //     title: "Application Incomplete",
  //     description: "We couldn't verify your eligibility. This may be due to document clarity or specific visa/income requirements.",
  //     benefitsTitle: "To Resolve This:",
  //     benefits: ["Ensure documents are clear", "Check visa validity rules", "Re-upload payslips", "Contact support"],
  //     containerClass: "bg-red-50 border-red-200 text-red-800",
  //     buttonText: "Return to Dashboard",
  //   },
  // };

  const statusConfig = {
    processing: {
      icon: <Loader2 className="h-16 w-16 text-[#2d7a7a] animate-spin mx-auto" />,
      title: "Submitting Verification...",
      description: "We are securely posting your documents to our eligibility engine. Please don't refresh the page.",
      benefits: undefined as string[] | undefined,
      containerClass: "bg-gray-50 border-gray-200",
      buttonText: undefined as string | undefined,
    },
    approved: {
      icon: <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />,
      title: "Congratulations!",
      description: "You've been fully approved for Gold Membership. Your installment plans are now active.",
      benefits: ["Furniture & Appliances", "Vehicle Financing", "Electronics Purchases", "Priority Support"],
      containerClass: "bg-green-50 border-green-200 text-green-800",
      buttonText: "Go to Dashboard",
    },
    "conditionally-approved": {
      icon: <Clock className="h-16 w-16 text-blue-500 mx-auto" />,
      title: "Pre-Approval Granted",
      description: "Your home-country verification is successful. Once you arrive at your destination, we will finalize your membership.",
      benefits: ["OTP Phone Verification", "Submit local payslips", "Final Visa validation"],
      containerClass: "bg-blue-50 border-blue-200 text-blue-800",
      buttonText: "View Pre-Approval Details",
    },
    rejected: {
      icon: <XCircle className="h-16 w-16 text-red-500 mx-auto" />,
      title: "Action Required",
      description: "We couldn't verify your eligibility with the current documents. Our team will review your application manually.",
      benefits: ["Check document clarity", "Review income requirements", "Contact support"],
      containerClass: "bg-red-50 border-red-200 text-red-800",
      buttonText: "Return to Dashboard",
    },
  };

  const current = statusConfig[eligibilityStatus as keyof typeof statusConfig];

  if (isLoading) return statusConfig.processing.icon;

  if (error) {
    return (
      <div className="text-center py-10 animate-in fade-in">
        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Submission Error</h2>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          We encountered an issue while processing your POST request. This might be due to a network timeout.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => { hasTriggered.current = false; window.location.reload(); }} className="bg-[#2d7a7a]" >
            Retry Submission
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-6">{current.icon}</div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">{current.title}</h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">{current.description}</p>

      {current.benefits && (
        <div className={cn("rounded-xl border p-6 mb-8 text-left max-w-md mx-auto", current.containerClass)}>
          <h3 className="font-bold mb-4 uppercase tracking-wider text-xs">
            {eligibilityStatus === "approved" ? "Your Benefits:" : "Required for full access:"}
          </h3>
          <ul className="space-y-3">
            {current.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href="/dashboard" className="w-full max-w-xs">
        <Button className="w-full bg-[#2d7a7a] hover:bg-[#1f5a5a] text-white h-12 shadow-lg group">
          {current.buttonText || "Return to Dashboard"}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  );
}