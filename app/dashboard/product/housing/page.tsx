'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import { PropertyEmptyState } from "@/components/dashboard/products/property/propertyEmptyState";

export default function HousingPage() {
  return (
    <CategoryListingsPage
      urlSegment="housing"
      title="Housing"
      subtitle="Find rentals and properties listed by verified sellers."
      searchPlaceholder="Search by location, type, or keyword..."
      backLabel="Back to Housing"
      EmptyState={PropertyEmptyState}
    />
  );
}
