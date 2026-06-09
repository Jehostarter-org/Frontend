import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useGetBoostedListingsQuery,
} from "@/lib/api/productsApiSlice";

const formatPrice = (price: string | number, currency = "NGN") => {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(price || 0));
  } catch {
    return `${currency} ${price}`;
  }
};

export default function ShopHighlights() {
  // Only boosted listings — no fallback to regular products
  const { data: boosted = [], isLoading } = useGetBoostedListingsQuery();
  const highlights = boosted.slice(0, 4);

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
                (typeof firstImage === "string"
                  ? firstImage
                  : firstImage?.image) || "/placeholder.svg";

              return (
                <Link
                  key={item.id}
                  href="/dashboard/product/marketplace"
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={image}
                        alt={item.title || "Shop listing"}
                        fill
                        sizes="48px"
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
                    {formatPrice(item.price, item.currency)}
                  </span>
                </Link>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}