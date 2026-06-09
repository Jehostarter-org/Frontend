"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useGetPropertyQuery } from "@/lib/api/propertyApiSlice";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { PaymentView } from "@/components/dashboard/property-listing/paymentView";
import { SuccessView } from "@/components/dashboard/property-listing/successView";
import { PropertyDetailsView } from "@/components/dashboard/property-listing/propertyDetailsView";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type WizardStep = "details" | "payment" | "success";

export default function PropertyDynamicPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [step, setStep] = useState<WizardStep>("details");

  const { data: property, isLoading, isError } = useGetPropertyQuery(id);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="max-w-6xl mx-auto p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-48 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (isError || !property) {
    return (
      <DashboardShell>
        <div className="max-w-6xl mx-auto p-6">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="text-center py-16 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-800 font-medium">Property not found or failed to load.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Map backend property fields to the PropertyDetails shape expected by PropertyDetailsView
  const mappedProperty = {
    id: property.id ?? id,
    title: property.propertyTitle || (property as any).property_title || "Untitled Property",
    description: property.description || "",
    type: (property.propertyType || (property as any).property_type || "Apartment") as any,
    price: Number(property.priceAmount || (property as any).price_amount || 0),
    currency: (property as any).currency || "NGN",
    address: property.address || "",
    availability: {
      isAvailable: (property as any).status === "published",
      availableFrom: property.availableFrom || (property as any).available_from || "",
    },
    amenities: ((property as any).amenities || []).map((a: string) => ({ id: a, label: a })),
    images: ((property as any).images || []).map((url: string, i: number) => ({
      id: String(i),
      url,
      alt: `Property image ${i + 1}`,
    })),
    stats: {
      guests: 2,
      bedrooms: Number(property.bedrooms || 1),
      bathrooms: Number(property.bathrooms || 1),
    },
  };

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto mb-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === "details" && (
          <PropertyDetailsView
            property={mappedProperty}
            onBack={() => router.back()}
            onReserve={() => setStep("payment")}
          />
        )}

        {step === "payment" && (
          <PaymentView
            price={mappedProperty.price}
            currency={mappedProperty.currency}
            onBack={() => setStep("details")}
            onConfirm={() => setStep("success")}
          />
        )}

        {step === "success" && (
          <SuccessView onHome={() => router.push("/dashboard")} />
        )}
      </div>
    </DashboardShell>
  );
}
