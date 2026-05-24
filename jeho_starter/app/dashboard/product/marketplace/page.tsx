'use client';

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/components/contexts/auth-context";
import { useCurrency } from "@/components/contexts/currencyContext";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { ProductItemCard } from "@/components/reuseables/productItemCard";
import ProductDetailView from "@/components/reuseables/product-detail-view";
import { ProductItemCardSkeleton } from "@/components/reuseables/productItemCardSkeleton";
import { Search, X, Loader2, ArrowLeft, SearchX, Sparkles, RefreshCw } from "lucide-react";
import { useGetAllProductsQuery, type ListingsParams } from "@/lib/api/productsApiSlice";

// Stable one-time shuffle — runs once per data identity, not per render
function shuffleOnce<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MarketPlacePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const isAuthenticated = !!user;
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Stable shuffled cache — only recomputed when productsData reference changes
  const shuffledRef = useRef<any[]>([]);
  const lastDataRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearch.trim().length > 0;

  const queryParams: ListingsParams = useMemo(() => {
    if (isSearching) return { search: debouncedSearch };
    return {};
  }, [isSearching, debouncedSearch]);

  const {
    data: productsData,
    isLoading: isLoadingAll,
    isFetching: isFetchingSearch,
    isError: isErrorAll,
    refetch,
  } = useGetAllProductsQuery(queryParams);

  const displayProducts = useMemo(() => {
    const items = Array.isArray(productsData) ? productsData : [];
    if (items.length === 0) return [];

    // When searching, return as-is (relevance order)
    if (isSearching) return items;

    // Only re-shuffle when the data reference actually changes
    if (productsData !== lastDataRef.current) {
      lastDataRef.current = productsData;
      shuffledRef.current = shuffleOnce(items);
    }

    return shuffledRef.current;
  }, [isSearching, productsData]);

  const handleProductClick = (product: any) => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setSelectedProduct(product);
  };

  if (selectedProduct) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-between p-6 border-b bg-white top-0 z-10 custom-scrollbar">
            <Button variant="ghost" onClick={() => setSelectedProduct(null)} className="text-teal-600 hover:text-teal-800 font-black uppercase tracking-widest text-xs flex items-center gap-2">
              <ArrowLeft size={16} /> Back to Marketplace
            </Button>
            <h2 className="hidden md:block text-sm font-black uppercase tracking-tighter text-gray-400">
              Viewing: <span className="text-slate-900 px-2">{selectedProduct.title}</span>
            </h2>
          </div>
          <ProductDetailView product={selectedProduct} />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-teal-600 font-black text-[10px] uppercase tracking-[0.3em]">
                <Sparkles size={14} className="animate-pulse" />
                <span>Marketplace</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic uppercase">
                Explore <span className="text-teal-600 not-italic px-3">JEHOSTARTER SHOP</span>
              </h1>
              <p className="text-gray-500 font-medium max-w-xl text-sm leading-relaxed">
                Discover items across all categories, randomly curated for you every time you visit.
              </p>
            </div>

            <div className="relative w-full lg:max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isFetchingSearch ? (
                  <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
                ) : (
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                )}
              </div>
              <Input
                type="text"
                placeholder="Find anything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-8 bg-white border-none rounded-lg focus:ring-4 focus:ring-teal-500/10 outline-none transition-all shadow-2xl shadow-gray-200/50 text-base font-medium"
              />
              {searchTerm && (
                <Button variant="ghost" onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-900 h-auto p-0">
                  <X size={20} />
                </Button>
              )}
            </div>
          </div>
        </header>

        {isErrorAll && (
          <div className="p-6 mb-10 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
            <p className="text-rose-600 font-bold text-sm uppercase tracking-tight">Syncing error. Showing cached results if available.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-full border-rose-200 text-rose-600">
              <RefreshCw size={14} className="mr-2" /> Retry Sync
            </Button>
          </div>
        )}

        {isLoadingAll ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(15)].map((_, i) => <ProductItemCardSkeleton key={i} />)}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayProducts.map((product: any) => (
              <ProductItemCard
                key={product.id}
                product={product}
                onSelect={handleProductClick}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        ) : (
          <EmptyState term={debouncedSearch} onClear={() => setSearchTerm("")} />
        )}
      </div>
    </DashboardShell>
  );
}

function EmptyState({ term, onClear }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-dashed border-gray-100 shadow-inner">
      <div className="bg-teal-50 p-8 rounded-full mb-8 text-teal-600 animate-bounce">
        <SearchX className="w-16 h-16" />
      </div>
      <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">No Luck!</h3>
      <p className="text-gray-400 max-w-sm text-center mt-3 px-6 text-sm font-bold uppercase tracking-widest leading-loose">
        {term ? `Nothing found for "${term}"` : "The marketplace is currently resting."}
      </p>
      <Button
        onClick={onClear}
        className="mt-10 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-black uppercase tracking-[0.2em] text-xs px-10 py-6 shadow-xl shadow-teal-500/20 transition-all hover:scale-105"
      >
        Refresh Catalog
      </Button>
    </div>
  );
}