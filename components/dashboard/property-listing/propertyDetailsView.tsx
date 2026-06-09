import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils"; 
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyDetails } from "@/components/types/property";
import { ArrowLeft, MapPin, Users, Bed, Bath, Wifi, CheckCircle2 } from "lucide-react";

interface DetailsViewProps {
  property: PropertyDetails;
  onReserve: () => void;
  onBack: () => void;
}

export const PropertyDetailsView = ({ property, onReserve }: DetailsViewProps) => {
    const router = useRouter();
    
  return (
    <div className="space-y-2 animate-in fade-in duration-500">
      <div className="py-1">
        <Button variant="ghost" className="mb-6 md:-ml-50 bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] rounded-2xl overflow-hidden">
        <div className="md:col-span-2 h-full bg-gray-200 relative">
           <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">Main Image</div>
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 md:col-span-2 h-full">
           <div className="bg-gray-200 h-full relative"><div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Bedroom</div></div>
           <div className="bg-gray-200 h-full relative"><div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Kitchen</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          
          <div>
            <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">{property.type}</Badge>
                {property.availability.isAvailable ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Available Now</span>
                ) : (
                    <span className="text-xs text-red-500 font-medium">Currently Unavailable</span>
                )}
            </div>
            <h1 className="text-3xl font-bold text-slate-900">{property.title}</h1>
            <p className="flex items-center gap-2 text-gray-500 mt-2">
                <MapPin className="w-4 h-4" /> {property.address}
            </p>
          </div>

          <div className="flex items-center gap-6 py-4 border-y border-gray-100">
             <div className="flex items-center gap-2 text-sm text-gray-700"><Users className="w-4 h-4"/> {property.stats.guests} Guests</div>
             <div className="flex items-center gap-2 text-sm text-gray-700"><Bed className="w-4 h-4"/> {property.stats.bedrooms} Bedrooms</div>
             <div className="flex items-center gap-2 text-sm text-gray-700"><Bath className="w-4 h-4"/> {property.stats.bathrooms} Bath</div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">About this place</h3>
            <p className="text-gray-600 leading-relaxed">{property.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">What this place offers</h3>
            <div className="grid grid-cols-2 gap-4">
                {property.amenities.map(am => (
                    <div key={am.id} className="flex items-center gap-3 text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-teal-500" /> 
                        {am.label}
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
            <div className="sticky top-8 border rounded-xl p-6 shadow-sm bg-white">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(property.price)}</span>
                        <span className="text-gray-500 text-sm"> / year</span>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                        <span className="text-gray-500 block text-xs mb-1">Check-in Date</span>
                        <span className="font-medium text-gray-900">{property.availability.availableFrom}</span>
                    </div>
                </div>

                <Button onClick={onReserve} size="lg" className="w-full bg-teal-800 hover:bg-teal-900 text-white shadow-md">
                    Reserve Now
                </Button>
                
                <p className="text-center text-xs text-gray-400 mt-4">You won't be charged yet</p>
            </div>
        </div>
      </div>
    </div>
  );
};