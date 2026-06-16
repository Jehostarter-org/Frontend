import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyDetails } from "@/components/types/property";
import { ProductImageGallery } from "@/components/reuseables/product-image-gallery";
import { ArrowLeft, MapPin, Users, Bed, Bath, CheckCircle2, ShieldCheck } from "lucide-react";

interface DetailsViewProps {
  property: PropertyDetails;
  onReserve: () => void;
  onBack?: () => void;
}

export const PropertyDetailsView = ({ property, onReserve, onBack }: DetailsViewProps) => {
  const router = useRouter();

  const imageUrls = useMemo(() => {
    return property.images.map((img) => img.url);
  }, [property.images]);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 animate-in fade-in duration-500 bg-white border border-gray-300 rounded-2xl lg:min-h-[calc(100vh-140px)] flex flex-col overflow-hidden">
      {/* Back Button */}
      <div className="shrink-0 mb-4">
        <Button
          variant="ghost"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={onBack || (() => router.back())}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 flex-1 overflow-y-auto lg:overflow-hidden">
        {/* LEFT — Image Gallery */}
        <div className="lg:col-span-7 lg:overflow-y-auto lg:pr-4">
          <ProductImageGallery images={imageUrls} title={property.title} />
        </div>

        {/* RIGHT — Details */}
        <div className="lg:col-span-5 space-y-6 lg:overflow-y-auto lg:pr-2 pb-6">
          {/* Title & Status */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                {property.type}
              </Badge>
              {property.availability.isAvailable ? (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Available Now
                </span>
              ) : (
                <span className="text-xs text-red-500 font-medium">Currently Unavailable</span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{property.title}</h1>
            <p className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" /> {property.address}
            </p>
          </section>

          {/* Stats */}
          <div className="flex items-center gap-6 py-4 border-y border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4" /> {property.stats.guests} Guests
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Bed className="w-4 h-4" /> {property.stats.bedrooms} Bedrooms
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Bath className="w-4 h-4" /> {property.stats.bathrooms} Bath
            </div>
          </div>

          {/* Booking Card */}
          <Card className="border-teal-100 bg-teal-50/30 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(property.price)}</span>
                <span className="text-sm text-gray-500">/ year</span>
              </div>
              <div className="flex items-center gap-3 text-teal-800">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold">Verified Property</span>
              </div>
              <Button
                onClick={onReserve}
                className="w-full h-12 bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-md"
                disabled={!property.availability.isAvailable}
              >
                Reserve Now
              </Button>
              <p className="text-center text-xs text-gray-400">You won't be charged yet</p>
            </CardContent>
          </Card>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">About this place</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">What this place offers</h3>
            <div className="grid grid-cols-2 gap-3">
              {property.amenities.map((am) => (
                <div key={am.id} className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-sm">{am.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available From */}
          {property.availability.availableFrom && (
            <div className="border-t pt-4">
              <span className="text-xs text-gray-500 block mb-1">Available From</span>
              <span className="font-medium text-gray-900">{property.availability.availableFrom}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};