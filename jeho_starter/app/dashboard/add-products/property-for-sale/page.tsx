'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import { CurrencyProvider } from "@/components/contexts/currencyContext";
import PropertyForSalePage from "@/components/add-product/property-for-sale-form";

export default function Page() {
  return (
    <DashboardShell>
      <CurrencyProvider>
        <PropertyForSalePage />
      </CurrencyProvider>
    </DashboardShell>
  )
}