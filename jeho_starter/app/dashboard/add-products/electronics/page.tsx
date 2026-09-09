'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "electronics",
          pageTitle: "List Electronics",
          itemNoun: "Item",
          titleLabel: "Item Title",
          titlePlaceholder: "e.g. iPhone 14 Pro — 256GB, excellent condition",
          subcategoryLabel: "Item Type",
          subcategoryPlaceholder: "Select item type",
          descriptionPlaceholder: "Brand, model, storage, condition, reason for selling...",
          publishLabel: "Publish Item",
        }}
      />
    </DashboardShell>
  );
}