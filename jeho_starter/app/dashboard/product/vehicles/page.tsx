'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import VehiclesEmptyState from "@/components/dashboard/products/vehicles/vehiclesEmptyState";

export default function VehiclesPage() {
  return (
    <CategoryListingsPage
      urlSegment="vehicles"
      title="Vehicles"
      subtitle="Discover verified automotive deals near you."
      searchPlaceholder="Search by model or brand..."
      backLabel="Back to Inventory"
      EmptyState={VehiclesEmptyState}
    />
  );
}
