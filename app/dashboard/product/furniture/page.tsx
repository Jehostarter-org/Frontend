'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import { FurnitureEmptyState } from "@/components/dashboard/products/furniture/furnitureEmptyState";

export default function FurniturePage() {
  return (
    <CategoryListingsPage
      urlSegment="furniture"
      title="Furniture"
      subtitle="Quality home and office furniture from local sellers."
      searchPlaceholder="Search furniture, room, or style..."
      backLabel="Back to Furniture"
      tabs={["All", "Living Room", "Bedroom", "Office", "Dining", "Outdoor"]}
      EmptyState={FurnitureEmptyState}
    />
  );
}
