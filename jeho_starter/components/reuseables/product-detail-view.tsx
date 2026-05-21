'use client'

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Bookmark, Share2, ChevronLeft, ChevronRight, ShieldCheck, MapPin } from "lucide-react";

interface ProductDetailViewProps {
  product: any; // accepts both old shape and new API shape
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // ── Normalise field names ─────────────────────────────────────────────────
  // API returns: images (array of {id, image}), shop_name, created_at, city, price (string)
  // Old shape used: productImages (string[]), sellerName, createdAt, location, price (number)
  const images: string[] = useMemo(() => {
    if (product?.productImages?.length) return product.productImages;
    if (product?.images?.length) {
      return product.images.map((img: any) =>
        typeof img === "string" ? img : img.image ?? ""
      ).filter(Boolean);
    }
    return [];
  }, [product]);

  const sellerName: string = product?.sellerName ?? product?.shop_name ?? "Seller";
  const createdAt: string  = product?.createdAt  ?? product?.created_at ?? "";
  const location: string   = product?.location   ?? product?.city       ?? "";
  const condition: string  = product?.condition  ?? "";
  const currency: string   = product?.currency   ?? "NGN";
  const rawPrice           = product?.price ?? 0;
  const price: number      = typeof rawPrice === "string" ? parseFloat(rawPrice) : rawPrice;

  const handlePrevImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const formattedPrice = useMemo(() => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${currency} ${price}`;
    }
  }, [price, currency]);

  const timeAgo = useMemo(() => {
    if (!createdAt) return "recently";
    const diffInHours = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1)  return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  }, [createdAt]);

  const currentImage = images[currentImageIndex] || "/placeholder.svg";

  return (
    <div className="max-w-7xl mx-auto lg:p-6 animate-in fade-in duration-500 bg-white border border-gray-300 rounded-b-2xl lg:h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 flex-1 overflow-y-auto lg:overflow-hidden custom-scrollbar">

        {/* LEFT — Images */}
        <div className="lg:col-span-7 flex flex-col lg:overflow-y-auto lg:pr-4 custom-scrollbar">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 border border-gray-100 group shrink-0">
            <Image
              src={currentImage}
              alt={product?.title ?? "Product"}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
            {images.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="rounded-full shadow-xl" onClick={handlePrevImage}>
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button variant="secondary" size="icon" className="rounded-full shadow-xl" onClick={handleNextImage}>
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto py-4 shrink-0 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "relative w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                    currentImageIndex === idx
                      ? "border-teal-600 scale-95"
                      : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Info */}
        <div className="lg:col-span-5 flex flex-col space-y-6 lg:overflow-y-auto lg:pr-2 custom-scrollbar pb-6">
          <section className="space-y-4 shrink-0">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                {condition && (
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-none">
                    {condition.replace("_", " ")}
                  </Badge>
                )}
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  {product?.title}
                </h1>
                {sellerName && (
                  <p className="text-sm text-gray-500">by <span className="font-semibold text-gray-700">{sellerName}</span></p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setIsSaved(!isSaved)}>
                  <Bookmark className={cn("h-5 w-5", isSaved && "fill-teal-600 text-teal-600")} />
                </Button>
                <Button variant="ghost" size="icon"><Share2 className="h-5 w-5" /></Button>
              </div>
            </div>

            <div className="flex items-baseline justify-between border-b pb-4">
              <span className="text-3xl lg:text-4xl font-black text-teal-700">{formattedPrice}</span>
              <span className="text-xs text-gray-400">Listed {timeAgo}</span>
            </div>
          </section>

          {/* Action Card */}
          <Card className="border-teal-100 bg-teal-50/30 overflow-hidden shadow-sm shrink-0">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3 text-teal-800">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold">Buyer Protection Guaranteed</span>
              </div>
              <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold shadow-md transition-all active:scale-[0.98]">
                Buy Now
              </Button>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="space-y-6">
            {product?.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</h3>
                <p className="text-sm lg:text-base text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2 text-gray-900 text-sm">
                  <MessageCircle className="h-5 w-5 text-teal-600" />
                  Chat with Seller
                </h3>
                <Button className="w-full bg-teal-600 text-white hover:bg-teal-700 h-11">
                  Send Message
                </Button>
              </div>
            </div>

            {location && (
              <div className="space-y-2 border-t pt-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </h3>
                <p className="text-sm text-gray-600 font-medium">{location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}