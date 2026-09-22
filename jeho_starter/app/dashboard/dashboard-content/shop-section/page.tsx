'use client';

import ServiceCards from "../service-cards/page";
import WelcomeBanner from "@/components/dashboard/shop/welcome-banner";
import ActivityAnalytics from "@/components/dashboard/shop/activity-analytics";
import ShopHighlights from "@/components/dashboard/shop/shop-highlight";
import ProgressTracker from "@/components/dashboard/shop/progress-tracker";
import LocalNavigation from "@/components/dashboard/shop/local-navigation";
import { SystemAlertsBanner } from "@/components/reuseables/system-alert-banner";
import CommunityLiveFeed from "@/components/dashboard/community/communityLiveFeed";
import MigrationOfficeCard from "@/components/dashboard/shop/migration-office-card";


export default function ShopSection() {
  return (
    <div className="bg-gray-50/50 w-full">
      <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
        
        <div className="flex-1 space-y-6 min-w-0">
          <WelcomeBanner />

          <ActivityAnalytics />

          <ServiceCards />

          <MigrationOfficeCard />

          <LocalNavigation />

          <div className="xl:hidden gap-5 flex flex-col">
            <SystemAlertsBanner />
            <ProgressTracker />
          </div>

          <ShopHighlights />

          <CommunityLiveFeed />
        </div>

        <aside className="hidden xl:block w-80 space-y-6 shrink-0">
          <SystemAlertsBanner />
          <ProgressTracker />
        </aside>

      </div>
    </div>
  );
}
