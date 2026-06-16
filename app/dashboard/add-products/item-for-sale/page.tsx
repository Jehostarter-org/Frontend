'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import ItemForSaleForm from "@/components/add-product/item-for-sale-form";

export default function Page() {
  return (
    <DashboardShell>
      <ItemForSaleForm />
    </DashboardShell>
  )
}