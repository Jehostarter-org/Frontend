"use client"

import DashboardShell from "@/components/dashboard/dashboard-layout";
import AirportPickupForm from "@/components/dashboard/airport-pickup/airport-pickup";

export default function AirportPickup() {

    return (
        <DashboardShell>
            <AirportPickupForm />
        </DashboardShell>
    )
}
