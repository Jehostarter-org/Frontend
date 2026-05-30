'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import { EquipmentEmptyState } from "@/components/dashboard/products/equipment-tools/equipmentEmptyState";

export default function EquipmentStore() {
  return (
    <CategoryListingsPage
      urlSegment="equipment-tools"
      title="Equipment & Tools"
      subtitle="Power tools, hand tools, and gear for every job."
      searchPlaceholder="Search tools, brands, or equipment..."
      backLabel="Back to Tools"
      tabs={["All", "Power Tools", "Hand Tools", "Safety Gear", "Gardening", "Industrial"]}
      EmptyState={EquipmentEmptyState}
    />
  );
}
