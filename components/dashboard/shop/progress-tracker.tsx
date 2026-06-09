"use client";

import { useAuth } from "@/components/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { useGetMyShopQuery } from "@/lib/api/productsApiSlice";

export default function ProgressTracker() {
  const { user } = useAuth();

  // Check if user has a shop
  const { data: myShop } = useGetMyShopQuery(undefined, {
    // Only fetch if user exists — skip silently if they have no shop yet
  });

  const steps = [
    {
      number: 1,
      label:  "Account Created",
      // Always true if they're logged in
      completed: !!user,
    },
    {
      number: 2,
      label:  "Identity Verified",
      completed: !!user?.isVerified,
    },
    {
      number: 3,
      label:  "Plan Selected",
      // Any plan other than free counts as selected
      completed: !!(user?.plan && user.plan !== "free"),
    },
    {
      number: 4,
      label:  "Terms Accepted",
      completed: !!user?.acceptedTerms,
    },
    {
      number: 5,
      label:  "Shop Set Up",
      completed: !!myShop,
    },
  ];

  return (
    <Card className="border-gray-200 shadow-sm h-auto">
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Your Progress</h3>
        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-start gap-4 pb-8 last:pb-0 relative">
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-[15px] top-8 w-0.5 h-full transition-colors duration-300 ${
                    step.completed ? "bg-teal-200" : "bg-gray-100"
                  }`}
                  aria-hidden="true"
                />
              )}

              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
                  step.completed
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white text-gray-400 border-2 border-gray-100"
                }`}
              >
                {step.completed ? "✓" : step.number}
              </div>

              <div className="pt-1.5">
                <p className={`text-sm font-medium ${step.completed ? "text-gray-900" : "text-gray-400"}`}>
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}