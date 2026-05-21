'use client';

import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useMemo } from "react";
import { useCurrency } from "@/components/contexts/currencyContext";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { Search, X, Loader2, Sofa, ArrowUpDown } from "lucide-react";
import { ProductItemCard } from "@/components/reuseables/productItemCard";
import { ProductDetailView } from "@/components/reuseables/product-detail-view";
import { ProductItemCardSkeleton } from "@/components/reuseables/productItemCardSkeleton";
import { useGetAllProductsQuery, useSearchProductsByTitleQuery } from "@/lib/api/productsApiSlice";
import { FurnitureEmptyState } from "@/components/dashboard/products/furniture/furnitureEmptyState";


type FurnitureCategory = "All" | "Living Room" | "Bedroom" | "Office" | "Dining" | "Outdoor";
type SortOption = "newest" | "price-low" | "price-high";

const CATEGORIES: FurnitureCategory[] = ["All", "Living Room", "Bedroom", "Office", "Dining", "Outdoor"];

export default function FurniturePage() {
  const { formatPrice } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory>("All");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearch.trim().length > 0;
  const { data: allProducts, isLoading: isLoadingAll, isFetching: isFetchingAll } = useGetAllProductsQuery(undefined, { skip: isSearching });
  const { data: searchResults, isLoading: isLoadingSearch, isFetching: isFetchingSearch } = useSearchProductsByTitleQuery(debouncedSearch, { skip: !isSearching });
  const rawData = isSearching ? searchResults : allProducts;
  const isLoading = isLoadingAll || isLoadingSearch;
  const isFetching = isFetchingAll || isFetchingSearch;

  const filteredFurniture = useMemo(() => {
    const dataArray = rawData?.content || (Array.isArray(rawData) ? rawData : []);
    if (!Array.isArray(dataArray)) return [];

    return dataArray
      .filter((item: any) => {
        const isFurniture = item.category === "HOME_AND_FURNITURE";
        let matchesSubs = true;
          if (activeCategory !== "All") {
          const furnitureItem = (item.subCategory || "").toLowerCase().trim();
          const selectedTab = activeCategory.toLowerCase().trim();
          matchesSubs = furnitureItem === selectedTab;
        }
        return isFurniture && matchesSubs;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [rawData, activeCategory, sortBy]);

  if (selectedProduct) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-between p-6 border-b bg-white top-0 z-10 custom-scrollbar">
            <Button onClick={() => setSelectedProduct(null)} className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-2 transition-colors" >
              ← Back to Showroom
            </Button>
            <h1 className="text-lg font-bold truncate max-w-xs md:max-w-md text-gray-800">{selectedProduct.title}</h1>
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
              <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Home & Furniture</h1>
              <p className="text-muted-foreground mt-1">Curated pieces to transform your living space.</p>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                )}
              </div>
              <input type="text" placeholder="Search sofas, tables, or decor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all shadow-sm text-sm"
              />
              {searchTerm && (
                <Button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-900">
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>

          <nav className="flex items-center overflow-x-auto pb-2 no-scrollbar border-b border-gray-100">
            {CATEGORIES.map((furnitures) => (
              <Button key={furnitures} variant="ghost" onClick={() => setActiveCategory(furnitures)}   className={`rounded-none pb-4 border-b-2 transition-all px-6 whitespace-nowrap uppercase text-xs tracking-widest font-bold ${
                activeCategory === furnitures ? "border-teal-600 text-teal-600 font-bold" : "border-transparent text-gray-400 hover:text-gray-900"
              }`} >
                {furnitures}
              </Button>
            ))}
          </nav>
        </header>

        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            {filteredFurniture.length} Items available
          </p>
          
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-400" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} aria-label="Sort furniture by" className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer hover:text-teal-700 transition-colors" >
              <option value="newest">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => <ProductItemCardSkeleton key={i} />)}
          </div>
        ) : filteredFurniture.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredFurniture.map((furniture: any) => (
              <ProductItemCard
                key={furniture.id} 
                furniture={furniture}
                onSelect={setSelectedProduct} 
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <FurnitureEmptyState
            category={activeCategory} 
            isSearch={isSearching} 
            onClear={() => { setSearchTerm(""); setActiveCategory("All"); }} 
          />
        )}
      </div>
    </DashboardShell>
  );
}