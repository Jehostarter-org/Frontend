'use client';

import { Button } from "@/components/ui/button";
import React, { useState, useMemo } from "react";
import { Search, X, Loader2, ArrowUpDown } from "lucide-react";
import { useCurrency } from "@/components/contexts/currencyContext";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { ProductItemCard } from "@/components/reuseables/productItemCard";
import ProductDetailView from "@/components/reuseables/product-detail-view";
import { ProductItemCardSkeleton } from "@/components/reuseables/productItemCardSkeleton";
import VehiclesEmptyState from "@/components/dashboard/products/vehicles/vehiclesEmptyState";
import { useCategoryListings } from "@/hooks/use-category-listings";

type SortOption = "newest" | "price-low" | "price-high";

export default function VehiclesPage() {
  const { formatPrice } = useCurrency();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { listings, isLoading, isError } = useCategoryListings("vehicles");

  const filteredVehicles = useMemo(() => {
    let items = listings ?? [];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    return [...items].sort((a: any, b: any) => {
      if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price);
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [listings, searchTerm, sortBy]);

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
              ← Back to Inventory
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
              <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Vehicles</h1>
              <p className="text-muted-foreground mt-1">Discover verified automotive deals near you.</p>
            </div>

            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                ) : (
                  <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                )}
              </div>
              <input
                type="text"
                placeholder="Search by model or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 outline-none transition-all shadow-sm text-sm"
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
        </header>

        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            {filteredVehicles.length} Items Available
          </p>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-400" />
            <select
              value={sortBy}
              aria-label="Sort vehicles by"
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="newest">Newest Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => <ProductItemCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-bold text-sm uppercase tracking-widest">Failed to load listings. Please try again.</p>
          </div>
        ) : filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredVehicles.map((vehicle: any) => (
              <ProductItemCard
                key={vehicle.id}
                product={vehicle}
                onSelect={setSelectedProduct}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <VehiclesEmptyState />
        )}
      </div>
    </DashboardShell>
  );
}