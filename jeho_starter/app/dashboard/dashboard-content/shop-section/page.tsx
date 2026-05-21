'use client';

import { useState } from "react";
import ServiceCards from "../service-cards/page";
import { useAuth } from "@/components/contexts/auth-context";
import WelcomeBanner from "@/components/dashboard/shop/welcome-banner";
import ShopHighlights from "@/components/dashboard/shop/shop-highlight";
import ProgressTracker from "@/components/dashboard/shop/progress-tracker";
import CommunityWidget from "@/components/dashboard/shop/community-widget";
import LocalNavigation from "@/components/dashboard/shop/local-navigation";
import { mockGroupMessages } from "@/components/dashboard/community/message-community";
import { SystemAlertsBanner } from "@/components/reuseables/system-alert-banner";
import CommunityLiveFeed from "@/components/dashboard/community/communityLiveFeed";
import MigrationSpecialistCard from "@/components/dashboard/shop/migration-specialist-card";


export default function ShopSection() {
  const { user } = useAuth();
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | undefined>();

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setMapLocation(location);
  };

  return (
    <main className="flex-1 bg-gray-50/50 w-full custom-scrollbar">
      <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
        
        <div className="flex-1 space-y-6 min-w-0">
          <WelcomeBanner firstName={user?.firstName}  plan={user?.plan} />

          <ServiceCards />

          <div className="xl:hidden gap-5 flex flex-col">
            <SystemAlertsBanner />
            <ProgressTracker />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LocalNavigation onLocationChange={handleLocationChange}  mapLocation={mapLocation} />
            <ShopHighlights />
          </div>

          <div className="xl:hidden">
            <MigrationSpecialistCard />
          </div>

          <CommunityWidget />
          <CommunityLiveFeed allMessages={Object.values(mockGroupMessages).flat()} />
        </div>

        <aside className="hidden xl:block w-80 space-y-6 shrink-0">
          <SystemAlertsBanner />
          <ProgressTracker />
          <MigrationSpecialistCard />
        </aside>

      </div>
    </main>
  );
}
