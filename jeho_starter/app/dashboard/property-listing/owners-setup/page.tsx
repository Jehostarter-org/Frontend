"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BenefitCard } from "@/components/reuseables/benefitCard";
import DashboardShell from "@/components/dashboard/dashboard-layout";


export default function OwnerBenefitsPage() {
  const router = useRouter();

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto p-5 mb-10 animate-in fade-in">
        <div className="py-1">
          <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-200  hover:bg-gray-400 text-gray-700" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900">
              Temporary Housing Listing
            </h1>
          </div>

          <div className="space-y-6">
            <BenefitCard
              color="text-teal-700"
              bgColor="bg-blue-50"
              borderColor="border-blue-200"
              title="Easy Setup"
              desc="Get your property listed in minutes with our simple 4-step process."
            />
            <BenefitCard
              color="text-green-600"
              bgColor="bg-green-50"
              borderColor="border-green-200"
              title="Quality Tenants"
              desc="Access verified tenants with screening, references, and rental history."
            />
            <BenefitCard
              color="text-purple-600"
              bgColor="bg-purple-50"
              borderColor="border-purple-200"
              title="Earn More"
              desc="Earn competitive rates with our dynamic pricing model."
            />
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() =>
                router.push("/dashboard/property-listing/owners-setup/create")
              }
              className="w-full bg-teal-800 hover:bg-teal-900 text-white py-6 rounded-lg font-bold text-lg"
            >
              Start Listing
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
