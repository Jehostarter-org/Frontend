"use client";

import { useMemo } from "react";
import {
  CATEGORY_SLUGS,
  useGetAllProductsQuery,
  type ListingsParams,
  type Product,
} from "@/lib/api/productsApiSlice";

export function resolveCategorySlug(urlSegment: string): string {
  // Marketplace page shows listings across every category.
  if (urlSegment === "marketplace") return "";
  return CATEGORY_SLUGS[urlSegment] ?? urlSegment;
}

export function useCategoryListings(
  urlSegment: string,
  options?: { search?: string },
) {
  const slug = resolveCategorySlug(urlSegment);

  const params: ListingsParams = useMemo(() => {
    const p: ListingsParams = {};
    if (slug) p.category = slug;
    const q = options?.search?.trim();
    if (q) p.search = q;
    return p;
  }, [slug, options?.search]);

  const { data, isLoading, isError, isFetching, refetch } =
    useGetAllProductsQuery(params);

  return {
    listings: (data ?? []) as Product[],
    isLoading,
    isError,
    isFetching,
    refetch,
    categorySlug: slug,
  };
}

/** Client-side tab filter — matches keywords in title/description (backend has no subCategory). */
export function filterByTab(listings: Product[], tab: string): Product[] {
  if (!tab || tab === "All") return listings;
  const needle = tab.toLowerCase();
  return listings.filter((item) =>
    `${item.title} ${item.description}`.toLowerCase().includes(needle),
  );
}

export type SortOption = "newest" | "price-low" | "price-high";

export function sortListings(listings: Product[], sortBy: SortOption): Product[] {
  return [...listings].sort((a, b) => {
    if (sortBy === "price-low") {
      return parseFloat(String(a.price)) - parseFloat(String(b.price));
    }
    if (sortBy === "price-high") {
      return parseFloat(String(b.price)) - parseFloat(String(a.price));
    }
    return (
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
    );
  });
}
