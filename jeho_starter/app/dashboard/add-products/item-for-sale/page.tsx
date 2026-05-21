'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import ItemForSaleForm from "@/components/add-product/item-for-sale-form";
import { CurrencyProvider } from "@/components/contexts/currencyContext";

export default function Page() {
  return (
    <DashboardShell>
      <CurrencyProvider>
       <ItemForSaleForm />
      </CurrencyProvider>
    </DashboardShell>
  )
}