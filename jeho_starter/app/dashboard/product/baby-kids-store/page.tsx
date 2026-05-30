'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import { BabyKidsStoreEmptyState } from "@/components/dashboard/products/baby-kids-store/babyKidsStoreEmptyState";

export default function BabyKidsPage() {
  return (
    <CategoryListingsPage
      urlSegment="baby-kids-store"
      title="Baby & Kids"
      subtitle="Toys, clothing, and essentials for little ones."
      searchPlaceholder="Search baby and kids items..."
      backLabel="Back to Baby & Kids"
      tabs={["All", "Toys", "Clothing", "Gear", "Feeding", "Safety"]}
      EmptyState={BabyKidsStoreEmptyState}
    />
  );
}
