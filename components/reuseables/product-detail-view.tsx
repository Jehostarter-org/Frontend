'use client'

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Bookmark, Share2, ShieldCheck, MapPin, BadgeCheck } from "lucide-react";
import { useAuth } from "@/components/contexts/auth-context";
import { useCart } from "@/components/contexts/cart-context";
import { useCurrency } from "@/components/contexts/currencyContext";
import { useStartConversationMutation } from "@/lib/api/messagesApiSlice";
import { ProductImageGallery } from "@/components/reuseables/product-image-gallery";

interface ProductDetailViewProps {
  product: any; // accepts both old shape and new API shape
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const { isLoggedIn } = useAuth();
  const { isInCart, toggleBookmark } = useCart();
  const { formatPrice } = useCurrency();
  const [startConversation, { isLoading: isStartingConversation }] = useStartConversationMutation();

  const listingId = product?.id ?? '';
  const isSaved = listingId ? isInCart(listingId) : false;

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
  const sellerId: string | number | null =
    product?.seller_id ?? product?.sellerId ?? product?.shop?.owner_id ?? product?.shop?.owner ?? null;
  const createdAt: string  = product?.createdAt  ?? product?.created_at ?? "";
  const location: string   = product?.location   ?? product?.city       ?? "";
  const condition: string  = product?.condition  ?? "";
  const currency: string   = product?.currency   ?? "NGN";
  const rawPrice           = product?.price ?? 0;
  const price: number      = typeof rawPrice === "string" ? parseFloat(rawPrice) : rawPrice;



  const formattedPrice = useMemo(() => {
    return formatPrice(price, currency);
  }, [price, currency, formatPrice]);

  const timeAgo = useMemo(() => {
    if (!createdAt) return "recently";
    const diffInHours = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    );
    if (diffInHours < 1)  return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  }, [createdAt]);

  const currentImage = images[0] || "/placeholder.svg";

  const handleBookmark = async () => {
    if (!listingId) return;
    if (!isLoggedIn) {
      toast.error('Sign in to save items to your cart');
      return;
    }
    setIsSaving(true);
    try {
      await toggleBookmark(product);
      toast.success(isSaved ? 'Removed from cart' : 'Added to your cart');
    } catch {
      toast.error('Could not update your cart');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product?.title ?? "Check this out";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Could not copy link");
      }
    }
  };

  const handleMessageSeller = async () => {
    if (!isLoggedIn) {
      toast.error("Sign in to chat with the seller");
      return;
    }

    if (!sellerId && !listingId) {
      toast.error("Seller contact is not available for this listing yet");
      return;
    }

    try {
      const recipientId = sellerId ? Number(sellerId) : null;
      const conversation = await startConversation({
        ...(recipientId && Number.isFinite(recipientId) ? { recipient_id: recipientId } : {}),
        initial_message: `Hi, I am interested in ${product?.title ?? "your listing"}.`,
        linked_object_type: "shop_listing",
        linked_object_id: listingId || null,
        service_card: {
          title: product?.title ?? "Shop listing",
          price,
          currency,
          location,
          listing_id: listingId,
          image: currentImage,
          seller_name: sellerName,
        },
      }).unwrap();

      toast.success("Chat opened with seller");
      router.push(`/dashboard/community?tab=messages&conversation=${conversation.id}`);
    } catch (err: any) {
      const message =
        err?.data?.recipient_id?.[0] ||
        err?.data?.detail ||
        err?.data?.non_field_errors?.[0] ||
        "Could not start chat with seller";
      toast.error(message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto lg:p-6 animate-in fade-in duration-500 bg-white border border-gray-300 rounded-b-2xl lg:h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 flex-1 overflow-y-auto lg:overflow-hidden custom-scrollbar">

        {/* LEFT — Images */}
        <div className="lg:col-span-7 flex flex-col lg:overflow-y-auto lg:pr-4 custom-scrollbar">
          <ProductImageGallery images={images} title={product?.title ?? 'Product'} />
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
                  <p className="text-sm text-gray-500">
                    by <span className="font-semibold text-gray-700">{sellerName}</span>
                    {(product?.shop?.is_verified || product?.is_verified) && (
                      <BadgeCheck className="inline h-4 w-4 ml-1 text-blue-500 -mt-0.5" />
                    )}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isSaving}
                  onClick={handleBookmark}
                  aria-label={isSaved ? 'Remove from cart' : 'Save to cart'}
                >
                  <Bookmark className={cn("h-5 w-5", isSaved && "fill-teal-600 text-teal-600")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleShare}><Share2 className="h-5 w-5" /></Button>
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
              <Button
                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white text-lg font-bold shadow-md transition-all active:scale-[0.98]"
                onClick={() => {
                  if (!listingId) { toast.error("Product not available"); return; }
                  const params = new URLSearchParams({
                    productId: listingId,
                    productName: product?.title ?? "Product",
                    price: price.toString(),
                  });
                  router.push(`/dashboard/payment?${params.toString()}`);
                }}
              >
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
                <Button
                  className="w-full bg-teal-600 text-white hover:bg-teal-700 h-11"
                  onClick={handleMessageSeller}
                  disabled={isStartingConversation}
                >
                  {isStartingConversation ? "Opening chat..." : "Send Message"}
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
