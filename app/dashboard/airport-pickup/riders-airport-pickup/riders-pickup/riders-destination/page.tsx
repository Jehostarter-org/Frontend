"use client";

import DashboardShell from "@/components/dashboard/dashboard-layout"
import StepFiveArrival from "@/components/dashboard/airport-pickup/riders-pickup/riders-destination"

export default function ArrivalPage() {
  return (
    <DashboardShell>
      <StepFiveArrival />
    </DashboardShell>
  )
}
