"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { SelectionCard } from "@/components/reuseables/cardSelection";
import { PROPERTY_ROLES } from "@/app/dashboard/property-listing/propertyRole-stats";

export default function PropertyListingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>("tenant");

  const handleContinue = () => {
    if (selectedRole === "tenant") {
      router.push("/dashboard/property-listing/tenants/property-search");
    } else {
      router.push("/dashboard/property-listing/owners-setup");
    }
  };

  return (
    <DashboardShell>  
      <div className="max-w-5xl mx-auto p-5 mb-10">
        <div className="py-1">
          <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-200  hover:bg-gray-400 text-gray-700" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12">
    
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Property Listing</h1>
          <p className="text-gray-400 font-medium max-w-lg mx-auto mt-3">
            Tell us who you are so we can tailor the experience for you.
          </p>
        </div>

        <div className="space-y-4 max-w-xl mx-auto">
          {PROPERTY_ROLES.map((role) => (
            <SelectionCard
              key={role.id}
              id={role.id}
              title={role.title}
              description={role.description}
              icon={role.icon}
              isSelected={selectedRole === role.id}
              onClick={() => setSelectedRole(role.id)}
            />
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <Button onClick={handleContinue} disabled={!selectedRole} className={cn( "w-full max-w-sm py-6 text-base font-medium shadow-md transition-all rounded-xl",
            "bg-teal-800 hover:bg-teal-900 text-white", "disabled:opacity-50 disabled:cursor-not-allowed" )}
           >
            Continue
          </Button>
        </div>
      </div>
    </div>
    </DashboardShell>
  );
}
