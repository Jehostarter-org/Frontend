"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, Loader2, ArrowUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useCurrency } from "@/components/contexts/currencyContext";
import { ProductItemCard } from "@/components/reuseables/productItemCard";
import ProductDetailView from "@/components/reuseables/product-detail-view";
import { ProductItemCardSkeleton } from "@/components/reuseables/productItemCardSkeleton";
import {
  filterByTab,
  sortListings,
  useCategoryListings,
  type SortOption,
} from "@/hooks/use-category-listings";
import type { Product } from "@/lib/api/productsApiSlice";
import { useGetSingleProductQuery } from "@/lib/api/productsApiSlice";

const ADD_PRODUCT_ROUTE: Record<string, string> = {
  vehicles: "/dashboard/add-products/vehicles",
  "baby-kids-store": "/dashboard/add-products/baby-kids",
  books: "/dashboard/add-products/books",
  electronics: "/dashboard/add-products/electronics",
  "equipment-tools": "/dashboard/add-products/equipment-tools",
  fashion: "/dashboard/add-products/fashion",
  furniture: "/dashboard/add-products/furniture",
  housing: "/dashboard/add-products/housing",
  other: "/dashboard/add-products/other",
};

export interface CategoryListingsPageProps {
  urlSegment: string;
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  backLabel?: string;
  sortNewestLabel?: string;
  tabs?: string[];
  EmptyState: React.ComponentType<{
    category?: string;
    isSearch?: boolean;
    onClear?: () => void;
  }>;
}

export default function CategoryListingsPage({
  urlSegment,
  title,
  subtitle,
  searchPlaceholder = "Search listings...",
  backLabel = "Back to Catalog",
  sortNewestLabel = "Newest Listed",
  tabs,
  EmptyState,
}: CategoryListingsPageProps) {
  const { formatPrice } = useCurrency();
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Support ?listing= deep-link from shared URLs ──────────────────────────
  const listingIdParam = searchParams.get("listing");
  const { data: linkedProduct } = useGetSingleProductQuery(listingIdParam!, {
    skip: !listingIdParam,
  });

  useEffect(() => {
    if (linkedProduct && !selectedProduct) {
      setSelectedProduct(linkedProduct);
    }
  }, [linkedProduct, selectedProduct]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearch.trim().length > 0;

  const { listings, isLoading, isError, isFetching } = useCategoryListings(
    urlSegment,
    { search: debouncedSearch, subcategory: activeTab },
  );

  const displayListings = useMemo(() => {
    const filtered = filterByTab(listings, activeTab);
    return sortListings(filtered, sortBy);
  }, [listings, activeTab, sortBy]);

  const handleSelect = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    setActiveTab("All");
  }, []);

  if (selectedProduct) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-between p-6 border-b bg-white top-0 z-10">
            <Button
              variant="ghost"
              onClick={() => setSelectedProduct(null)}
              className="text-teal-600 hover:text-teal-800 font-bold flex items-center gap-2 transition-colors"
            >
              ← {backLabel}
            </Button>
            <h1 className="text-lg font-bold truncate max-w-xs md:max-w-md text-gray-800">
              {selectedProduct.title}
            </h1>
          </div>
          <ProductDetailView product={selectedProduct} />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <header className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">{title}</h1>
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href={ADD_PRODUCT_ROUTE[urlSegment] ?? "/dashboard/add-products?tab=manage"}>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm gap-2 shadow-md shadow-teal-600/15 transition-all active:scale-95">
                  <Plus size={16} strokeWidth={3} />
                  Add Product
                </Button>
              </Link>

              <div className="relative w-full md:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  ) : (
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                  )}
                </div>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-sm text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-900"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {tabs && tabs.length > 0 && (
            <nav className="flex items-center overflow-x-auto pb-2 no-scrollbar border-b border-gray-100">
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  variant="ghost"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-none pb-4 border-b-2 transition-all px-6 whitespace-nowrap uppercase text-xs tracking-widest font-bold ${
                    activeTab === tab
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </Button>
              ))}
            </nav>
          )}
        </header>

        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            {displayListings.length} Items Available
          </p>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-400" />
            <select
              value={sortBy}
              aria-label="Sort listings"
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="newest">{sortNewestLabel}</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <ProductItemCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-bold text-sm uppercase tracking-widest">
              Failed to load listings. Please try again.
            </p>
          </div>
        ) : displayListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayListings.map((product) => (
              <ProductItemCard
                key={product.id}
                product={product}
                onSelect={handleSelect}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            category={activeTab}
            isSearch={isSearching}
            onClear={handleClear}
          />
        )}
      </div>
    </DashboardShell>
  );
}
