"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, Shield, MapPin, User as UserIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import {
  useGetDriverServiceRequestQuery,
  useClaimServiceRequestMutation,
} from "@/lib/api/riderApiSlice";

const HELP_TYPE_LABELS: Record<string, string> = {
  bank_account: "Bank Account Opening Assistance",
  tax_file: "Tax File Number Reference",
  cv_job_readiness: "CV & Job-Readiness Assistance",
  reference: "Reference Assistance",
  settlement: "Other Settlement Assistance",
};

export default function ChaperoneConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceRequestId =
    searchParams.get("id") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("activeDriverServiceId") ?? ""
      : "");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: serviceRequest, isLoading: isLoadingRequest, isError: isNotFound } =
    useGetDriverServiceRequestQuery(serviceRequestId, {
      skip: !serviceRequestId,
    });

  const [claimJob, { isLoading: isClaiming }] =
    useClaimServiceRequestMutation();

  const chaperoneDetails = serviceRequest?.chaperone_details;
  const helpType = chaperoneDetails?.help_type
    ? HELP_TYPE_LABELS[chaperoneDetails.help_type] || chaperoneDetails.help_type
    : "—";
  const location = chaperoneDetails?.location || serviceRequest?.city || "—";

  const price = serviceRequest?.price
    ? new Intl.NumberFormat("en", {
        style: "currency",
        currency: serviceRequest.currency || "NGN",
        minimumFractionDigits: 0,
      }).format(Number(serviceRequest.price))
    : null;

  const handleAccept = async () => {
    if (!serviceRequestId) {
      toast.error("No service selected.");
      return;
    }

    try {
      await claimJob(serviceRequestId).unwrap();
      toast.success("Request accepted!");
      setIsSubmitted(true);
      sessionStorage.removeItem("activeDriverServiceId");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      const msg =
        error?.data?.detail ||
        "Could not accept this request. It may have been taken by another chaperone.";
      toast.error(msg);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto mb-5">
        <div className="py-1">
          <Button
            variant="ghost"
            className="mb-6 bg-gray-200 hover:bg-gray-400 text-gray-700"
            onClick={() => router.back()}
            disabled={isClaiming}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12 transition-all">
          <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
            {isSubmitted ? "Request Accepted!" : "Chaperone Service Details"}
          </h1>

          <div className="mb-10 max-w-md mx-auto">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-in-out ${
                  isSubmitted ? "bg-green-500" : "bg-purple-600"
                }`}
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {isLoadingRequest && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <p className="text-gray-500 font-medium">Loading service details...</p>
            </div>
          )}

          {!serviceRequestId && !isLoadingRequest && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <p className="text-gray-500 font-medium">No service selected.</p>
              <Button variant="outline" onClick={() => router.push("/dashboard/notification")}>
                Browse Available Requests
              </Button>
            </div>
          )}

          {isNotFound && serviceRequestId && !isLoadingRequest && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <p className="text-gray-700 font-semibold">This request is no longer available.</p>
              <p className="text-gray-400 text-sm text-center max-w-xs">
                It may have been accepted by another chaperone.
              </p>
              <Button
                onClick={() => router.push("/dashboard/notification")}
                className="bg-purple-700 hover:bg-purple-800 text-white"
              >
                Browse Available Requests
              </Button>
            </div>
          )}

          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in zoom-in">
              <CheckCircle2 className="h-20 w-20 text-green-500" />
              <p className="text-gray-600 font-medium">Redirecting to dashboard...</p>
            </div>
          ) : (
            !isLoadingRequest && serviceRequestId && serviceRequest && (
              <>
                <div className="space-y-6">
                  {/* Service Type Header */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 border border-purple-100">
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Chaperone Service</p>
                      <p className="text-sm text-gray-500">{serviceRequest.description || "Help requested"}</p>
                    </div>
                  </div>

                  {/* Requester */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Requester</p>
                      <p className="font-semibold text-gray-900">{serviceRequest.requester_name}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 divide-y divide-gray-100">
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-500 text-sm">Help Type</span>
                      <span className="font-semibold text-gray-900 text-sm text-right max-w-[60%]">{helpType}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-500 text-sm">Location</span>
                      <span className="font-semibold text-gray-900 text-sm text-right max-w-[60%]">{location}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-500 text-sm">City</span>
                      <span className="font-semibold text-gray-900 text-sm text-right max-w-[60%]">
                        {[serviceRequest.city, serviceRequest.country_code].filter(Boolean).join(", ") || "—"}
                      </span>
                    </div>
                    {price && (
                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium text-gray-500 text-sm">Offer</span>
                        <span className="font-semibold text-purple-700 text-base font-black">{price}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-500 text-sm">Description</span>
                      <span className="font-semibold text-gray-900 text-sm text-right max-w-[60%]">
                        {serviceRequest.description || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Location Map Pin */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      You'll be assisting at <strong>{location}</strong> in {serviceRequest.city || "the specified area"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mt-10">
                  <Button
                    onClick={handleAccept}
                    disabled={isClaiming || !serviceRequestId}
                    className="w-full max-w-sm bg-purple-700 hover:bg-purple-800 text-white py-7 text-lg font-semibold shadow-md transition-all active:scale-[0.98]"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Accepting...
                      </>
                    ) : (
                      "Accept Request"
                    )}
                  </Button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
