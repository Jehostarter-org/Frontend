'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "housing",
          pageTitle: "List Property",
          itemNoun: "Property",
          titleLabel: "Property Title",
          titlePlaceholder: "e.g. 4-Bedroom Detached Duplex in Lekki",
          subcategoryLabel: "Property Type",
          subcategoryPlaceholder: "Select property type",
          descriptionPlaceholder: "Number of rooms, location, amenities, condition...",
          publishLabel: "Publish Property",
        }}
      />
    </DashboardShell>
  );
}