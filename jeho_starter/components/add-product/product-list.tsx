"use client";

import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMemo, memo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrency } from "../contexts/currencyContext";
import { useGetAllProductsQuery, useDeleteProductMutation } from "@/lib/api/productsApiSlice";
import { Trash2, Loader2, AlertCircle, PackageOpen, MapPin, Layers, Info, ChevronRight, ChevronLeft } from "lucide-react";



interface Product {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location: string;
  productLimit: number;
  productImages: string[];
  category: string;
}

export function ProductList() {
  const [currentPage, setCurrentPage] = useState(0);
  const { data, isLoading, isError, refetch } = useGetAllProductsQuery({undefined});
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const { formatPrice } = useCurrency();
  const products = useMemo(() => data?.content || [], [data]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this item from your inventory?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Item deleted successfully");
      } catch (err) {
        toast.error("Failed to delete item");
      }
    }
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (products.length === 0) return <EmptyState />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-600" />
          Inventory Ledger — {data?.totalElements || 0} Items
        </h2>
      </div>

      <div className="grid gap-6">
        {products.map((product: Product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            formatPrice={formatPrice} 
            onDelete={handleDelete} 
            isDeleting={isDeleting} 
          />
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-10 pb-6 border-t border-gray-100">
          <Button variant="ghost" disabled={currentPage === 0} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full px-4 h-10 hover:bg-teal-50 hover:text-teal-700 transition-all gap-2 font-bold text-xs uppercase tracking-widest" >
            <ChevronLeft size={16} /> Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-black">
              {currentPage + 1}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              of {data.totalPages} Pages
            </span>
          </div>

          <Button variant="ghost" disabled={data.last} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-full px-4 h-10 hover:bg-teal-50 hover:text-teal-700 transition-all gap-2 font-bold text-xs uppercase tracking-widest" >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}


const ProductCard = memo(({ product, formatPrice, onDelete, isDeleting }: { product: Product; formatPrice: (amt: number, curr?: string) => string; onDelete: (id: string) => void; isDeleting: boolean; }) => {
  return (
    <Card className="group relative overflow-hidden border-border/50 bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/5 hover:border-teal-500/30">
      <div className="flex flex-col md:flex-row p-0">
        <div className="relative w-full md:w-52 h-52 md:h-auto shrink-0 overflow-hidden bg-gray-50">
          <Image 
            src={product.productImages?.[0] || "/placeholder.svg"} 
            alt={product.title} 
            fill
            sizes="(max-width: 768px) 100vw, 208px"
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-teal-900 border-none shadow-sm font-bold text-[10px]">
            {product.category || "General"}
          </Badge>
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

              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 px-2.5 py-0.5 gap-1.5 rounded-full text-[10px] font-black uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </Badge>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-5 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Stock Level</span>
                <span className={cn( "text-sm font-black", product.productLimit < 5 ? "text-orange-600" : "text-gray-900" )}>
                  {product.productLimit} Units Available
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={() => onDelete(product.id)} variant="ghost" size="sm" disabled={isDeleting} className="h-9 w-9 rounded-full p-0 text-red-500 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-full px-4 h-9 font-bold text-xs gap-2 border-gray-200 hover:border-teal-500 hover:text-teal-700 transition-all">
                <Info className="w-3.5 h-3.5" />
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

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
      <p className="text-sm text-red-700/70 mb-6">We couldn't load your products. Check your connection.</p>
      <Button onClick={onRetry} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 rounded-full px-8">
        Try Again
      </Button>
    </div>
  );
}