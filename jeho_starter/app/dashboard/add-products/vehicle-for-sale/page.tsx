'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import VehicleForSalePage from "@/components/add-product/vehicle-for-sale-form";

export default function Page() {
  return (
    <DashboardShell>
      <VehicleForSalePage />
    </DashboardShell>
  )
}