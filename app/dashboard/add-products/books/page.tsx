'use client';

import DashboardShell from "@/components/dashboard/dashboard-layout";
import CategoryAddProductForm from "@/components/add-product/category-add-product-form";

export default function Page() {
  return (
    <DashboardShell>
      <CategoryAddProductForm
        config={{
          slug: "books",
          pageTitle: "List Book",
          itemNoun: "Book",
          titleLabel: "Book Title",
          titlePlaceholder: "e.g. Cracking the Coding Interview — 6th edition",
          subcategoryLabel: "Book Type",
          subcategoryPlaceholder: "Select book type",
          descriptionPlaceholder: "Author, edition, condition, ISBN...",
          publishLabel: "Publish Book",
        }}
      />
    </DashboardShell>
  );
}