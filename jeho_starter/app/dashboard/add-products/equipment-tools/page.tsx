'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "equipment-tools",
          pageTitle: "List Tool / Equipment",
          itemNoun: "Tool",
          titleLabel: "Item Title",
          titlePlaceholder: "e.g. Dewalt cordless drill kit",
          subcategoryLabel: "Tool Type",
          subcategoryPlaceholder: "Select tool type",
          descriptionPlaceholder: "Brand, power, condition, accessories included...",
          publishLabel: "Publish Tool",
        }}
      />
    </DashboardShell>
  );
}