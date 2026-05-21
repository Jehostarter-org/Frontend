'use client';

import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useMemo } from "react";
import { Search, X, Loader2, ArrowUpDown } from "lucide-react";
import { useCurrency } from "@/components/contexts/currencyContext";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { ProductItemCard } from "@/components/reuseables/productItemCard";
import ProductDetailView from "@/components/reuseables/product-detail-view";
import { ProductItemCardSkeleton } from "@/components/reuseables/productItemCardSkeleton";
import { useGetAllProductsQuery, type ListingsParams } from "@/lib/api/productsApiSlice";
import { ElectronicsEmptyState } from "@/components/dashboard/products/electronics/electronicsEmptyState";

type ElectronicCategory = "All" | "Phones" | "Laptops" | "Tablets" | "Accessories" | "Audio";
type SortOption = "newest" | "price-low" | "price-high";

const CATEGORIES: ElectronicCategory[] = ["All", "Phones", "Laptops", "Tablets", "Accessories", "Audio"];

export default function ElectronicPage() {
  const { formatPrice } = useCurrency();
  const [activeCategory, setActiveCategory]   = useState<ElectronicCategory>("All");
  const [sortBy, setSortBy]                   = useState<SortOption>("newest");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [searchTerm, setSearchTerm]           = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearch.trim().length > 0;

  const queryParams: ListingsParams = useMemo(() => ({
    category: "electronics",
    ...(isSearching && { search: debouncedSearch }),
  }), [isSearching, debouncedSearch]);

  const {
    data: allProducts,
    isLoading,
    isFetching,
  } = useGetAllProductsQuery(queryParams);

  const filteredElectronics = useMemo(() => {
    const items = Array.isArray(allProducts) ? allProducts : [];

    return items
      .filter((item: any) => {
        if (activeCategory === "All") return true;
        const itemCat = (item.subCategory || "").toLowerCase().trim();
        return itemCat === activeCategory.toLowerCase().trim();
      })
      .sort((a: any, b: any) => {
        if (sortBy === "price-low")  return parseFloat(a.price) - parseFloat(b.price);
        if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price);
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [allProducts, activeCategory, sortBy]);

  if (selectedProduct) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-between p-6 border-b bg-white top-0 z-10 custom-scrollbar">
            <Button
              variant="ghost"
              onClick={() => setSelectedProduct(null)}
              className="text-teal-600 hover:text-teal-800 font-bold flex items-center gap-2 transition-colors"
            >
              ← Back to Catalog
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
              <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Electronics</h1>
              <p className="text-muted-foreground mt-1">The latest gadgets and gear, verified and ready.</p>
            </div>

            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isFetching
                  ? <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  : <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />}
              </div>
              <input
                type="text"
                placeholder="Search specs, models, or brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-900"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <nav className="flex items-center overflow-x-auto pb-2 no-scrollbar border-b border-gray-100">
            {CATEGORIES.map((electronics) => (
              <Button
                key={electronics}
                variant="ghost"
                onClick={() => setActiveCategory(electronics)}
                className={`rounded-none pb-4 border-b-2 transition-all px-6 whitespace-nowrap uppercase text-xs tracking-widest font-bold ${
                  activeCategory === electronics
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-400 hover:text-gray-900"
                }`}
              >
                {electronics}
              </Button>
            ))}
          </nav>
        </header>

        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            {filteredElectronics.length} Items Available
          </p>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort products"
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => <ProductItemCardSkeleton key={i} />)}
          </div>
        ) : filteredElectronics.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredElectronics.map((electronic: any) => (
              <ProductItemCard
                key={electronic.id}
                product={electronic}
                onSelect={setSelectedProduct}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <ElectronicsEmptyState
            category={activeCategory}
            isSearch={isSearching}
            onClear={() => { setSearchTerm(""); setActiveCategory("All"); }}
          />
        )}
      </div>
    </DashboardShell>
  );
}