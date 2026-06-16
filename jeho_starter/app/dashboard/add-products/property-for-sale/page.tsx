'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import PropertyForSalePage from "@/components/add-product/property-for-sale-form";

export default function Page() {
  return (
    <DashboardShell>
      <PropertyForSalePage />
    </DashboardShell>
  )
}