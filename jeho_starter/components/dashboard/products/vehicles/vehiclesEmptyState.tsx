"use client";

// app/dashboard/product/vehicles/page.tsx
// Every category page follows this exact same pattern —
// only the urlSegment string changes.

import Image from "next/image";
import Link from "next/link";
import { useCategoryListings } from "@/hooks/use-category-listings";
import VehiclesEmptyState from "@/components/dashboard/products/vehicles/vehiclesEmptyState";

const formatPrice = (price: string | number, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency", currency, maximumFractionDigits: 0,
    }).format(Number(price || 0));
  } catch {
    return `${currency} ${price}`;
  }
};

export default function VehiclesPage() {
  const { listings, isLoading, isError } = useCategoryListings("vehicles");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="rounded-xl bg-gray-100 animate-pulse h-56" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Failed to load listings. Please try again.</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return <VehiclesEmptyState />;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Vehicles</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((item) => {
          const firstImage = item.images?.[0];
          const image =
            (typeof firstImage === "string" ? firstImage : firstImage?.image) ||
            "/placeholder.svg";

          return (
            <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative h-40 bg-gray-100">
                <Image src={image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{item.city}</p>
                <p className="text-sm font-bold text-teal-700 mt-2">
                  {formatPrice(item.price, item.currency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── OTHER CATEGORY PAGES ──────────────────────────────────────────────────────
// For every other category, copy this file and change two things:
//
// 1. useCategoryListings("vehicles")  →  useCategoryListings("electronics")
// 2. <VehiclesEmptyState />           →  <ElectronicsEmptyState />
//
// That's it. The hook and the API slice handle everything else.