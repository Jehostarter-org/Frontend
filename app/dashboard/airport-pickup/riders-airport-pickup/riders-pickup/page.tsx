"use client"

import DashboardShell from "@/components/dashboard/dashboard-layout";
import RidersPickupForm from "@/components/dashboard/airport-pickup/riders-pickup/riders-pickup-form";

export default function RidersPickup() {

    return (
        <DashboardShell>
            <RidersPickupForm />
        </DashboardShell>
    )
}
