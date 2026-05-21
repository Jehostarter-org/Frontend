"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyDetails } from "@/components/types/property";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { PaymentView } from "@/components/dashboard/property-listing/paymentView";
import { SuccessView } from "@/components/dashboard/property-listing/successView";
import { PropertyDetailsView } from "@/components/dashboard/property-listing/propertyDetailsView";


// --- MOCK DATA (In production, fetch this via API) ---
const MOCK_PROPERTY: PropertyDetails = {
  id: "1",
  title: "Luxury Oceanview Apartment",
  description: "Experience luxury living in this fully furnished apartment with breathtaking ocean views. Perfect for short or long stays.",
  type: "Apartment",
  price: 500000,
  currency: "NGN",
  address: "101 Victoria Island, Lagos",
  availability: {
    isAvailable: true,
    availableFrom: "2024-05-01",
  },
  stats: { guests: 2, bedrooms: 1, bathrooms: 1 },
  amenities: [
    { id: "wifi", label: "High-Speed WiFi" },
    { id: "ac", label: "Air Conditioning" },
    { id: "pool", label: "Swimming Pool" },
    { id: "gym", label: "Gym Access" },
    { id: "security", label: "24/7 Security" },
  ],
  images: [
    { id: "1", url: "/images/apartment-1.jpg", alt: "Living Room" },
    { id: "2", url: "/images/apartment-2.jpg", alt: "Bedroom" },
    { id: "3", url: "/images/apartment-3.jpg", alt: "Kitchen" },
  ],
};

type WizardStep = "details" | "payment" | "success";

export default function PropertyDynamicPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("details");

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto mb-5 animate-in fade-in slide-in-from-bottom-4 duration-500"> 
        {step === "details" && (
          <PropertyDetailsView property={MOCK_PROPERTY} onBack={() => router.back()}  onReserve={() => setStep("payment")} />
        )}
        
        {step === "payment" && (
          <PaymentView price={MOCK_PROPERTY.price} currency={MOCK_PROPERTY.currency} onBack={() => setStep("details")} onConfirm={() => setStep("success")} />
        )}
        
        {step === "success" && (
          <SuccessView onHome={() => router.push("/dashboard")} />
        )}
      </div>
    </DashboardShell>
  );
}