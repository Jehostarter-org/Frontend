'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "fashion",
          pageTitle: "List Fashion Item",
          itemNoun: "Item",
          titleLabel: "Item Title",
          titlePlaceholder: "e.g. Vintage denim jacket — size M",
          subcategoryLabel: "Item Type",
          subcategoryPlaceholder: "Select item type",
          descriptionPlaceholder: "Brand, size, colour, material, condition...",
          publishLabel: "Publish Item",
        }}
      />
    </DashboardShell>
  );
}