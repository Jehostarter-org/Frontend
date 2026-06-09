'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import { FashionEmptyState } from "@/components/dashboard/products/fashion/fashionEmptyState";

export default function FashionItems() {
  return (
    <CategoryListingsPage
      urlSegment="fashion"
      title="Fashion"
      subtitle="Upgrade your style with premium personal items."
      searchPlaceholder="Search styles, brands, or items..."
      backLabel="Back to Collection"
      sortNewestLabel="New Arrivals"
      tabs={["All", "Men's Clothing", "Women's Clothing", "Accessories", "Shoes"]}
      EmptyState={FashionEmptyState}
    />
  );
}
