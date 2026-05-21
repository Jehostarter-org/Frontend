"use client";

// hooks/use-category-listings.ts
// One hook used by every product category page.
// Pass the URL segment (e.g. "vehicles", "baby-kids-store") and get
// typed listings back, already filtered by the user's country via Django.

import { CATEGORY_SLUGS, useGetProductsByCategoryQuery } from "@/lib/api/productsApiSlice";

export function useCategoryListings(urlSegment: string) {
  const slug = CATEGORY_SLUGS[urlSegment] ?? urlSegment;

  const { data: listings = [], isLoading, isError, refetch } =
    useGetProductsByCategoryQuery(slug);

  return { listings, isLoading, isError, refetch };
}