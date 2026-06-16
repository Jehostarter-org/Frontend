"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Sparkles, MapPin, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/reuseables/SafeImage";
import { useCurrency } from "@/components/contexts/currencyContext";
import { useGetBoostedListingsQuery } from "@/lib/api/productsApiSlice";

function ProductPreview({ item, formatPrice }: { item: any; formatPrice: (n: number, c?: string) => string }) {
  const firstImage = item.images?.[0];
  const image =
    (typeof firstImage === "string" ? firstImage : firstImage?.image) || "/placeholder.svg";

  return (
    <div className="w-72 p-3 space-y-3 bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
      <div className="relative h-40 w-full rounded-lg overflow-hidden bg-gray-50">
        <SafeImage src={image} alt={item.title || "Product"} fill className="object-cover" />
        {item.is_boosted && (
          <Badge className="absolute top-2 left-2 bg-amber-400 text-amber-900 border-none text-[10px] font-bold gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Featured
          </Badge>
        )}
      </div>
      <div className="space-y-1.5">
        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.title}</h4>
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-base font-black text-teal-700">
          {formatPrice(Number(item.price || 0), item.currency)}
        </span>
        <div className="flex items-center gap-1 text-gray-400">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] font-bold truncate max-w-[100px]">
            {item.city || item.shop_name || "Marketplace"}
          </span>
        </div>
      </div>
      {item.category_name && (
        <div className="flex items-center gap-1 text-gray-400">
          <Tag className="w-3 h-3" />
          <span className="text-[10px] font-bold">{item.category_name}</span>
        </div>
      )}
    </div>
  );
}

export default function ShopHighlights() {
  const { formatPrice } = useCurrency();
  const { data: boosted = [], isLoading } = useGetBoostedListingsQuery();
  const highlights = boosted.slice(0, 4);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <Card className="h-auto border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">Shop Highlights</h3>
            {highlights.length > 0 && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold px-1.5 py-0">
                <Sparkles className="w-2.5 h-2.5 mr-1 inline" />
                Featured
              </Badge>
            )}
          </div>
          <Link href="/dashboard/product/marketplace">
            <ArrowUpRight className="h-5 w-5 text-gray-400 hover:text-teal-600 transition-colors" />
          </Link>
        </div>

        <div className="space-y-4">
          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3 animate-pulse">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && highlights.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">No boosted products yet.</p>
              <Link
                href="/dashboard/add-products?tab=list"
                className="text-xs text-teal-600 font-semibold hover:underline mt-1 block"
              >
                Boost a product to feature it here →
              </Link>
            </div>
          )}

          {/* Listings */}
          {!isLoading &&
            highlights.map((item) => {
              const firstImage = item.images?.[0];
              const image =
                (typeof firstImage === "string" ? firstImage : firstImage?.image) || "/placeholder.svg";

              return (
                <div key={item.id} className="relative group/item">
                  <Link
                    href={`/dashboard/product/marketplace/${item.id}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <SafeImage
                          src={image}
                          alt={item.title || "Shop listing"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {item.is_boosted && (
                          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {item.shop_name || item.category_name || "Marketplace"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 ml-2 flex-shrink-0">
                      {formatPrice(Number(item.price || 0), item.currency)}
                    </span>
                  </Link>

                  {/* Hover preview with bridge */}
                  {hoveredId === item.id && (
                    <div
                      className="absolute left-full top-0 h-full z-50 w-[300px]"
                    >
                      {/* Invisible bridge connecting item to preview */}
                      <div className="absolute inset-y-0 left-0 w-4" />
                      {/* Preview card */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <ProductPreview item={item} formatPrice={formatPrice} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
