'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useGetMyShopQuery } from "@/lib/api/productsApiSlice";
import { useGetAllProductsQuery } from "@/lib/api/productsApiSlice";
import { ProductItemCard } from "@/components/reuseables/productItemCard";
import { useCurrency } from "@/components/contexts/currencyContext";
import {
  Store, Plus, Package, TrendingUp, Settings,
  MapPin, Phone, Globe, ArrowRight, Sparkles,
} from "lucide-react";

export default function SellersProductPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const { data: shop, isLoading: shopLoading, isError: noShop } = useGetMyShopQuery();
  const { data: myListings, isLoading: listingsLoading } = useGetAllProductsQuery(
    {},
    { skip: !shop }
  );

  const listings = Array.isArray(myListings) ? myListings : [];

  // ── Loading ───────────────────────────────────────────────────────────────
  if (shopLoading) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 animate-pulse mx-auto" />
            <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mx-auto" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  // ── No shop yet — prompt creation ─────────────────────────────────────────
  if (noShop || !shop) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 overflow-hidden">
              {/* Top accent bar */}
              <div className="h-2 bg-gradient-to-r from-teal-400 via-teal-600 to-emerald-500" />

              <div className="p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto">
                  <Store className="w-10 h-10 text-teal-600" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-teal-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    <Sparkles size={12} />
                    <span>Seller Hub</span>
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
                    Open Your Shop
                  </h1>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                    Create your shop to start listing products and reaching buyers across the platform.
                  </p>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-3 gap-4 py-4">
                  {[
                    { icon: Package, label: "List Products" },
                    { icon: TrendingUp, label: "Track Sales" },
                    { icon: Globe, label: "Reach Buyers" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-teal-600" />
                      </div>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => router.push("/dashboard/sellers-product/create")}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Create Your Shop
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // ── Has shop — show seller dashboard ──────────────────────────────────────
  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">

        {/* Shop header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500" />
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Store className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tighter">{shop.name}</h1>
                  {shop.is_active && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 font-medium">
                  {shop.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {shop.city}
                    </span>
                  )}
                  {shop.whatsapp && (
                    <span className="flex items-center gap-1">
                      <Phone size={11} /> {shop.whatsapp}
                    </span>
                  )}
                  {shop.website && (
                    <span className="flex items-center gap-1">
                      <Globe size={11} /> {shop.website}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest"
              >
                <Link href="/dashboard/sellers-product/edit">
                  <Settings size={14} className="mr-2" /> Edit Shop
                </Link>
              </Button>
              <Button
                asChild
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-teal-500/20"
              >
                <Link href="/dashboard/add-products">
                  <Plus size={14} className="mr-2" /> Add Listing
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Listings", value: shop.listings_count ?? 0 },
            { label: "Active", value: listings.filter((l: any) => l.is_available).length },
            { label: "Boosted", value: listings.filter((l: any) => l.is_boosted).length },
            { label: "Currency", value: shop.currency ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Listings grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Your Listings</h2>
            <Button asChild variant="ghost" className="text-teal-600 text-xs font-black uppercase tracking-widest">
              <Link href="/dashboard/add-products">
                <Plus size={14} className="mr-1" /> New
              </Link>
            </Button>
          </div>

          {listingsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listings.map((product: any) => (
                <ProductItemCard
                  key={product.id}
                  product={product}
                  onSelect={() => {}}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-black text-gray-900 uppercase tracking-tighter">No listings yet</h3>
              <p className="text-gray-400 text-sm mt-1 mb-6">Start adding products to your shop</p>
              <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest">
                <Link href="/dashboard/add-products">
                  <Plus size={14} className="mr-2" /> Add First Listing
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}