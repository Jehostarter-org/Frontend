'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import { CurrencyProvider } from "@/components/contexts/currencyContext";
import VehicleForSalePage from "@/components/add-product/vehicle-for-sale-form";

export default function Page() {
  return (
    <DashboardShell>
      <CurrencyProvider>
        <VehicleForSalePage />
      </CurrencyProvider>
    </DashboardShell>
  )
}