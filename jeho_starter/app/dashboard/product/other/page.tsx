'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import { OtherEmptyState } from "@/components/dashboard/products/other/otherEmptyState";

export default function OtherStore() {
  return (
    <CategoryListingsPage
      urlSegment="other"
      title="Other"
      subtitle="Everything else that doesn't fit into the other categories."
      searchPlaceholder="Search items..."
      backLabel="Back to Other"
      tabs={["All", "Miscellaneous", "Collectibles", "Sports & Outdoors", "Health & Beauty", "General"]}
      EmptyState={OtherEmptyState}
    />
  );
}
