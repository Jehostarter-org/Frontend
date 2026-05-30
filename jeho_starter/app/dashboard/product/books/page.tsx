'use client';

import CategoryListingsPage from "@/components/dashboard/products/category-listings-page";
import { BooksEmptyState } from "@/components/dashboard/products/books/booksEmptyState";

export default function BookStore() {
  return (
    <CategoryListingsPage
      urlSegment="books"
      title="Books"
      subtitle="Textbooks, fiction, and study materials from the community."
      searchPlaceholder="Search title, author, or subject..."
      backLabel="Back to Books"
      tabs={["All", "Textbooks", "Fiction", "Study Aids", "Non-Fiction", "Children"]}
      EmptyState={BooksEmptyState}
    />
  );
}
