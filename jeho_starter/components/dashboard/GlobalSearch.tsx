"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, Users, ShoppingBag, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SafeImage } from "@/components/reuseables/SafeImage";
import { CommunityAvatar } from "@/components/reuseables/CommunityAvatar";
import { useGetCommunitiesQuery } from "@/lib/api/communityApiSlice";
import { useGetAllProductsQuery } from "@/lib/api/productsApiSlice";
import { useCurrency } from "@/components/contexts/currencyContext";
import { useAuth } from "@/components/contexts/auth-context";

const MIN_QUERY_LENGTH = 2;
const MAX_GROUPS = 5;
const MAX_ITEMS = 5;

export default function GlobalSearch() {
  const router = useRouter();
  const { formatPrice, countryCode } = useCurrency();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const country = user?.current_country || countryCode || undefined;

  const trimmed = query.trim();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(trimmed), 300);
    return () => clearTimeout(t);
  }, [trimmed]);

  const searching = debounced.length >= MIN_QUERY_LENGTH;

  const { data: communities = [], isFetching: isGroupsFetching } = useGetCommunitiesQuery(
    { search: debounced, country },
    { skip: !searching },
  );

  const { data: products = [], isFetching: isProductsFetching } = useGetAllProductsQuery(
    { search: debounced, country },
    { skip: !searching },
  );

  const groupResults = useMemo(
    () => communities.slice(0, MAX_GROUPS),
    [communities],
  );

  const itemResults = useMemo(
    () => products.filter((p) => p.is_available !== false).slice(0, MAX_ITEMS),
    [products],
  );

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const goGroup = (id: string) => {
    close();
    router.push(`/dashboard/community?group=${id}`);
  };

  const goItem = (id: string) => {
    close();
    router.push(`/dashboard/product/marketplace/${id}`);
  };

  const isTyping = trimmed.length > 0;
  const showPanel = open && isTyping;
  const isLoading =
    searching &&
    (isGroupsFetching || isProductsFetching) &&
    groupResults.length === 0 &&
    itemResults.length === 0;
  const hasResults = groupResults.length > 0 || itemResults.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search items & communities..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          className="pl-8 sm:pl-10 pr-8 bg-gray-100 border-0 text-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl ring-1 ring-gray-100 overflow-hidden z-50">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          ) : !hasResults && debounced.length >= MIN_QUERY_LENGTH ? (
            <div className="py-10 px-4 text-center">
              <p className="text-sm font-semibold text-gray-600">
                No results for &quot;{debounced}&quot;
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different keyword or browse the marketplace.
              </p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              {groupResults.length > 0 && (
                <div className="py-1">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Groups
                  </p>
                  {groupResults.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => goGroup(c.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                    >
                      <div className="h-9 w-9 shrink-0">
                        <CommunityAvatar
                          name={c.name}
                          className="h-full w-full rounded-full"
                          textClassName="text-[12px]"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800 truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {c.member_count} {c.member_count === 1 ? "member" : "members"}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {itemResults.length > 0 && (
                <div className="py-1 border-t border-gray-100">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <ShoppingBag className="w-3 h-3" /> Items
                  </p>
                  {itemResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => goItem(p.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors cursor-pointer"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {p.images?.[0]?.image ? (
                          <SafeImage
                            src={p.images[0].image}
                            alt={p.title}
                            width={36}
                            height={36}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-300">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-800 truncate">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {p.shop_name} · {formatPrice(Number(p.price) || 0, p.currency)}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    close();
                    router.push("/dashboard/product/marketplace");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                >
                  Browse all items in the store <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
