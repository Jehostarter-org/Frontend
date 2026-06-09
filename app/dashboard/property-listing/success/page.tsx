"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Auto redirect after some time
    // const timer = setTimeout(() => {
    //   router.push("/dashboard/property-listing");
    // }, 5000);
    // return () => clearTimeout(timer);
  }, [router]);

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Property Listed Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Your property has been successfully listed on our platform.
              Tenants will now be able to discover and apply for your property.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/dashboard/property-listing")}
              className="flex items-center gap-2 px-8 py-3"
            >
              <Home className="w-5 h-5" />
              View My Properties
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 px-8 py-3"
            >
              Back to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 rounded-xl p-6 mt-8">
            <h3 className="font-semibold text-blue-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Your property will be reviewed by our team</li>
              <li>• Once approved, it will be visible to potential tenants</li>
              <li>• You'll receive notifications when tenants show interest</li>
              <li>• You can manage applications and communications through your dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
