'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "furniture",
          pageTitle: "List Furniture",
          itemNoun: "Furniture",
          titleLabel: "Item Title",
          titlePlaceholder: "e.g. Solid wood dining table — 6 seats",
          subcategoryLabel: "Furniture Type",
          subcategoryPlaceholder: "Select furniture type",
          descriptionPlaceholder: "Material, dimensions, condition, reason for selling...",
          publishLabel: "Publish Furniture",
        }}
      />
    </DashboardShell>
  );
}