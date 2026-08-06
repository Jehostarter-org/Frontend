"use client";

import { SafeImage } from "@/components/reuseables/SafeImage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMemo, memo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "../contexts/currencyContext";
import { useGetMyProductsQuery, useDeleteProductMutation } from "@/lib/api/productsApiSlice";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditProductDialog } from "@/components/add-product/edit-item-dialog";
import {
  Trash2,
  Loader2,
  AlertCircle,
  PackageOpen,
  MapPin,
  Layers,
  ChevronRight,
  ChevronLeft,
  Zap,
  Sparkles,
  Pencil,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location: string;
  productLimit: number;
  productImages: string[];
  category: string;
  isBoosted: boolean;
}

export function ProductList() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<string | null>(null);

  const {
    data: rawData = [],
    isLoading,
    isError,
    refetch,
  } = useGetMyProductsQuery({ page: currentPage + 1 });

  const pageData = rawData as unknown;
  const items: unknown[] = Array.isArray(pageData)
    ? pageData
    : Array.isArray((pageData as { results?: unknown[] })?.results)
      ? (pageData as { results: unknown[] }).results
      : [];

  const paginated = pageData as { count?: number; next?: string | null; totalPages?: number } | unknown[];
  const totalCount: number =
    !Array.isArray(paginated) && paginated && "count" in paginated
      ? (paginated.count ?? items.length)
      : items.length;
  const pageSize = 10;
  const totalPages: number =
    !Array.isArray(paginated) && paginated && "totalPages" in paginated && paginated.totalPages
      ? paginated.totalPages
      : Math.max(1, Math.ceil(totalCount / pageSize));
  const isLastPage: boolean =
    !Array.isArray(paginated) && paginated && "next" in paginated ? !paginated.next : items.length < pageSize;

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const { formatPrice } = useCurrency();

  const products: Product[] = useMemo(
    () =>
      items.map((item) => {
        const row = item as Record<string, unknown>;
        const images = (row.images as unknown[]) ?? [];
        return {
          id: String(row.id),
          title: String(row.title ?? ""),
          price: Number(row.price ?? 0),
          currency: row.currency as string | undefined,
          location: String(row.city || row.shop_name || "Available nearby"),
          productLimit: (row.productLimit as number) ?? (row.is_available ? 1 : 0),
          productImages: images.map((image) =>
            typeof image === "string" ? image : String((image as { image?: string }).image ?? "")
          ),
          category: String(row.category_name || row.category || "General"),
          isBoosted: Boolean(row.is_boosted),
        };
      }),
    [items]
  );

  const handleBoost = (product: Product) => {
    const params = new URLSearchParams({
      productId: product.id,
      productName: product.title,
      price: "30",
    });
    router.push(`/dashboard/payment?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      toast.success("Item deleted successfully");
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const deleteProductObj = deleteTarget ? products.find(p => p.id === deleteTarget) : null;

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (products.length === 0) return <EmptyState />;

  return (
    <>
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => handleDelete(deleteTarget!)}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Product?"
        message="This will permanently remove this item from your inventory. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={isDeleting}
      />

      <EditProductDialog productId={editTarget} onClose={() => setEditTarget(null)} />

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600" />
          Inventory Ledger — {totalCount} Items
        </h2>
      </div>

      <div className="grid gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            formatPrice={formatPrice}
            onDelete={(id) => setDeleteTarget(id)}
            onEdit={(id) => setEditTarget(id)}
            onBoost={handleBoost}
            isDeleting={isDeleting}
            isBoosting={false}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-10 pb-6 border-t border-gray-100">
          <Button
            variant="ghost"
            disabled={currentPage === 0}
            onClick={() => {
              setCurrentPage((prev) => prev - 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-full px-4 h-10 hover:bg-teal-50 hover:text-teal-700 transition-all gap-2 font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-black">
              {currentPage + 1}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              of {totalPages} Pages
            </span>
          </div>

          <Button
            variant="ghost"
            disabled={isLastPage}
            onClick={() => {
              setCurrentPage((prev) => prev + 1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-full px-4 h-10 hover:bg-teal-50 hover:text-teal-700 transition-all gap-2 font-bold text-xs uppercase tracking-widest"
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
    </>
  );
}

const ProductCard = memo(
  ({
    product,
    formatPrice,
    onDelete,
    onEdit,
    onBoost,
    isDeleting,
    isBoosting,
  }: {
    product: Product;
    formatPrice: (amt: number, curr?: string) => string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onBoost: (product: Product) => void;
    isDeleting: boolean;
    isBoosting: boolean;
  }) => {
    return (
      <Card className="group relative overflow-hidden border-border/50 bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/5 hover:border-teal-500/30">
        <div className="flex flex-col md:flex-row p-0">
          <div className="relative w-full md:w-52 h-52 md:h-auto shrink-0 overflow-hidden bg-gray-50">
            <SafeImage
              src={product.productImages?.[0] || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-900 border-none shadow-sm font-bold text-[10px]">
              {product.category || "General"}
            </Badge>
            {product.isBoosted && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-amber-400 text-amber-900 border-none shadow-sm font-bold text-[10px] gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Boosted
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    {formatPrice(product.price, product.currency || "NGN")}
                  </h3>
                  <p className="text-lg font-semibold text-gray-700 leading-snug group-hover:text-teal-700 transition-colors line-clamp-1">
                    {product.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    {product.location}
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-100 px-2.5 py-0.5 gap-1.5 rounded-full text-[10px] font-black uppercase"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </Badge>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-5 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    Stock Level
                  </span>
                  <span
                    className={cn(
                      "text-sm font-black",
                      product.productLimit < 5 ? "text-orange-600" : "text-gray-900"
                    )}
                  >
                    {product.productLimit} Units Available
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!product.isBoosted && (
                  <Button
                    onClick={() => onBoost(product)}
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 h-9 font-bold text-xs gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-400 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Boost Product
                  </Button>
                )}
                <Button
                  onClick={() => onDelete(product.id)}
                  variant="ghost"
                  size="sm"
                  disabled={isDeleting}
                  className="h-9 w-9 rounded-full p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onEdit(product.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 h-9 font-bold text-xs gap-2 border-gray-200 hover:border-teal-500 hover:text-teal-700 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3">
        <PackageOpen className="w-10 h-10 text-gray-300" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">No items listed yet</h3>
      <p className="text-muted-foreground max-w-[280px] mt-2 text-sm leading-relaxed">
        Your inventory is empty. Start adding products to see them listed here.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
        Fetching Inventory...
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 bg-red-50/50 rounded-3xl border border-red-100 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-bold text-red-900">Sync Failed</h3>
      <p className="text-sm text-red-700/70 mb-6">
        We couldn&apos;t load your products. Check your connection.
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-red-200 text-red-700 hover:bg-red-100 rounded-full px-8"
      >
        Try Again
      </Button>
    </div>
  );
}
