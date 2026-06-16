import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Calendar, Home } from "lucide-react";

interface PropertyResultProps {
  id: string;
  title: string;
  desc: string;
  price: number;
  city?: string;
  state?: string;
  propertyType?: string;
  availableFrom?: string;
  images?: string[];
}

export function PropertyResultCard({
  id, title, desc, price, city, state, propertyType, availableFrom, images
}: PropertyResultProps) {
  const locationText = [city, state].filter(Boolean).join(', ');
  const coverImage = images?.[0];

  return (
    <Link href={`/dashboard/property-listing/tenants/property-search/${id}`} className="block group">
      <Card className="border-gray-200 transition-all duration-300 hover:border-teal-500 hover:shadow-lg cursor-pointer bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Image thumbnail */}
          {coverImage && (
            <div className="w-full sm:w-40 h-32 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          <div className="p-4 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-700 transition-colors truncate">
                  {title}
                </h3>
                {propertyType && (
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 text-xs capitalize">
                    <Home className="w-3 h-3 mr-1" />{propertyType}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{desc}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {locationText && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{locationText}
                  </span>
                )}
                {availableFrom && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />Available from {new Date(availableFrom).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="font-bold text-teal-800 text-xl">
                {formatCurrency(price)}
              </p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Per Month
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}