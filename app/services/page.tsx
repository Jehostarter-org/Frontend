import { OtherServicesContent } from "@/components/services/page";
import DashboardShell from "@/components/dashboard/dashboard-layout";


export const dynamic = 'force-dynamic';

export default function ServicesPage() {
  return (
    <DashboardShell>
      <OtherServicesContent />;
    </DashboardShell>
  ) 
}
