'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/components/contexts/auth-context";
import { useCurrency } from "@/components/contexts/currencyContext";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { ProductItemCard } from "@/components/reuseables/productItemCard";
import ProductDetailView from "@/components/reuseables/product-detail-view";
import { ProductItemCardSkeleton } from "@/components/reuseables/productItemCardSkeleton";
import { Search, X, Loader2, ArrowLeft, SearchX, Sparkles, RefreshCw, Plus } from "lucide-react";
import { useCategoryListings } from "@/hooks/use-category-listings";
import type { Product } from "@/lib/api/productsApiSlice";
import Link from "next/link";
import { useGetSingleProductQuery } from "@/lib/api/productsApiSlice";

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
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const isAuthenticated = !!user;
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

  const shuffledRef = useRef<Product[]>([]);
  const lastDataRef = useRef<Product[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearch.trim().length > 0;

  const {
    listings,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useCategoryListings("marketplace", { search: debouncedSearch });

  const displayProducts = useMemo(() => {
    if (listings.length === 0) return [];
    if (isSearching) return listings;

    if (listings !== lastDataRef.current) {
      lastDataRef.current = listings;
      shuffledRef.current = shuffleOnce(listings);
    }

    return shuffledRef.current;
  }, [isSearching, listings]);

  const handleProductClick = (product: Product) => {
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
            <Button variant="ghost" onClick={() => { setSelectedProduct(null); router.replace("/dashboard/product/marketplace"); }} className="text-teal-600 hover:text-teal-800 font-black uppercase tracking-widest text-xs flex items-center gap-2">
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
                Browse live listings from verified shops across every category.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/dashboard/add-products/item-for-sale">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm gap-2 shadow-md shadow-teal-600/15 transition-all active:scale-95">
                  <Plus size={16} strokeWidth={3} />
                  Add Product
                </Button>
              </Link>

            <div className="relative w-full lg:max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {isFetching ? (
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
          </div>
        </header>

        {isError && (
          <div className="p-6 mb-10 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
            <p className="text-rose-600 font-bold text-sm uppercase tracking-tight">Could not load listings from the server.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-full border-rose-200 text-rose-600">
              <RefreshCw size={14} className="mr-2" /> Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(15)].map((_, i) => <ProductItemCardSkeleton key={i} />)}
          </div>
        ) : displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayProducts.map((product) => (
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

function EmptyState({ term, onClear }: { term: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-dashed border-gray-100 shadow-inner">
      <div className="bg-teal-50 p-8 rounded-full mb-8 text-teal-600 animate-bounce">
        <SearchX className="w-16 h-16" />
      </div>
      <h3 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">No Luck!</h3>
      <p className="text-gray-400 max-w-sm text-center mt-3 px-6 text-sm font-bold uppercase tracking-widest leading-loose">
        {term ? `Nothing found for "${term}"` : "No listings yet. Check back soon."}
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
