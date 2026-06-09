import type React from "react"


export const dynamic = 'force-dynamic';

export default function DashboardLayouts({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-8 border-yellow-500 p-4 min-h-screen">
      <h1 className="text-yellow-600 font-bold">DASHBOARD LAYOUT (YELLOW)</h1>
      {children}
    </div>
  )
}