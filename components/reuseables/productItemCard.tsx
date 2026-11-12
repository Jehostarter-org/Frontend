import { MapPin, Zap, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/reuseables/SafeImage";

export function ProductItemCard({ product, tool, item, babyKids, electronics, property, vehicles, fashion, furniture, books, onSelect, formatPrice }: any) {
  const data = product || tool || item || property || electronics || vehicles || furniture || fashion || babyKids || books;
  if (!data) {
    console.error("ProductItemCard: No data received. Check your prop names (product, item, or property).");
    return null;
  }

  const images = data.productImages || data.images || [];
  const firstImage = images[0];
  const mainImage =
    (typeof firstImage === "string" ? firstImage : firstImage?.image) ||
    data.image ||
    "/placeholder.svg";
  const condition = data.productCondition || data.condition;
  const price = data.price || 0;
  const currency = data.currency || "AUD";
  const boosted = data.is_boosted || false;

  return (
    <Card onClick={() => onSelect(data)} className={`overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white rounded-lg shadow-md group w-full ${boosted ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-200/50' : 'border-none'}`} >
      <div className="aspect-[3/4] relative overflow-hidden bg-slate-50">
        <SafeImage src={mainImage} alt={data.title || "Product Image"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
        {boosted && (
          <div className="absolute top-1 left-1 z-10">
            <Badge className="bg-amber-500 text-white text-[8px] font-bold px-2 py-1 uppercase border-none tracking-widest flex items-center gap-1 shadow-lg">
              <Zap size={10} className="fill-white" /> Boosted
            </Badge>
          </div>
        )}
        {condition && (
          <div className="absolute top-1 right-1 z-10">
            <Badge className="bg-black/80 backdrop-blur-md text-white text-[8px] font-medium px-1 py-1 uppercase border-none tracking-widest">
              {condition.replace('_', ' ')}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-2 space-y-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-gray-800 text-sm md:text-base tracking-tight line-clamp-2 break-words min-h-[2rem]">
            {data.title}
          </h3>
          <p className="text-teal-600 font-black text-sm"> {formatPrice(price, currency)} </p>
        </div>

        <div className="flex items-center gap-1.5 text-gray-400 border-t pt-1">
          <MapPin size={14} className="text-teal-500 shrink-0" />
          <span className="truncate text-xs font-bold tracking-wider">
            {data.city || data.location || data.shop_name || "Available nearby"}
          </span>
          {(data?.shop?.is_verified || data?.is_verified) && (
            <BadgeCheck size={14} className="text-blue-500 shrink-0" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
