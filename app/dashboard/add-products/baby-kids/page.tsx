'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "baby-kids",
          pageTitle: "List Baby & Kids Item",
          itemNoun: "Item",
          titleLabel: "Item Title",
          titlePlaceholder: "e.g. Convertible crib with mattress",
          subcategoryLabel: "Item Type",
          subcategoryPlaceholder: "Select item type",
          descriptionPlaceholder: "Age range, brand, condition, safety features...",
          publishLabel: "Publish Item",
        }}
      />
    </DashboardShell>
  );
}