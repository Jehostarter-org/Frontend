"use client";

// import ShopSection from "./dashboard-content/shop-section/page";
// import DashboardShell from "@/components/dashboard/dashboard-layout";

export default function Dashboard() {
  console.log("Dashboard Page Rendering (NO SHELL)...");
  return (
    <div className="bg-green-500 text-white p-20 text-4xl font-bold min-h-screen">
      CRITICAL TEST: IF YOU SEE THIS, DASHBOARD SHELL IS THE PROBLEM.
      <br />
      IF YOU DO NOT SEE THIS, THE ISSUE IS IN APP/LAYOUT.TSX.
    </div>
  );
}

//  <DashboardShell onClose={() => { }}>
//       <ShopSection />
//     </DashboardShell>