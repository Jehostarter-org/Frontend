"use client";

import ShopSection from "./dashboard-content/shop-section/page";
import DashboardShell from "@/components/dashboard/dashboard-layout";

export default function Dashboard() {
  return (
    <DashboardShell onClose={() => { }}>
      <ShopSection />
    </DashboardShell>
  );
}
