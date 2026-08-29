'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "other",
          pageTitle: "List Item",
          itemNoun: "Item",
          titleLabel: "Item Title",
          titlePlaceholder: "e.g. Handcrafted leather wallet",
          subcategoryLabel: "Item Type",
          subcategoryPlaceholder: "Select item type",
          descriptionPlaceholder: "Describe your item in detail — brand, condition, reason for selling...",
          publishLabel: "Publish Item",
        }}
      />
    </DashboardShell>
  );
}