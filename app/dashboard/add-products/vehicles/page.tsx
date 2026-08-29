'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "vehicles",
          pageTitle: "List Vehicle",
          itemNoun: "Vehicle",
          titleLabel: "Vehicle Title",
          titlePlaceholder: "e.g. 2022 Toyota Camry — excellent condition",
          subcategoryLabel: "Vehicle Type",
          subcategoryPlaceholder: "Select vehicle type",
          descriptionPlaceholder: "Make, model, year, mileage, transmission, condition...",
          publishLabel: "Publish Vehicle",
        }}
      />
    </DashboardShell>
  );
}
