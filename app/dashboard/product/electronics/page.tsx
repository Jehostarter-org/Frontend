'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import { ElectronicsEmptyState } from "@/components/dashboard/products/electronics/electronicsEmptyState";

export default function ElectronicPage() {
  return (
    <CategoryListingsPage
      urlSegment="electronics"
      title="Electronics"
      subtitle="The latest gadgets and gear, verified and ready."
      searchPlaceholder="Search specs, models, or brands..."
      backLabel="Back to Catalog"
      sortNewestLabel="Newest First"
      tabs={["All", "Phones", "Laptops", "Tablets", "Accessories", "Audio"]}
      EmptyState={ElectronicsEmptyState}
    />
  );
}
