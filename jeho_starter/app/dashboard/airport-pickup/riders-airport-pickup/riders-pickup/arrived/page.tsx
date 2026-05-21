// app/dashboard/trip/[id]/arrival/page.tsx
"use client";

import ArrivalView from "./arrival_view";
import DashboardShell from "@/components/dashboard/dashboard-layout";

export default function ArrivalPage() {
  return (
    <DashboardShell>
      <div className="py-10 px-5">
        <ArrivalView 
          onNext={() => console.log("Go to rating...")} 
          // onBack is optional now!
        />
      </div>
    </DashboardShell>
  );
}