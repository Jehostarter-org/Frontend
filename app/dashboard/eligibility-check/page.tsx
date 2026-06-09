
import DashboardShell from "@/components/dashboard/dashboard-layout"
import { EligibilityForm } from "@/components/dashboard/eligibility-check/eligibility-form"


export const metadata = {
  title: "Gold Membership Eligibility Check | JEH Starter",
  description: "Check your eligibility for Gold Membership and access instalment payment services",
}

export default function EligibilityCheckPage() {
  return (
    <DashboardShell>
      <EligibilityForm />
    </DashboardShell>
  )
}

