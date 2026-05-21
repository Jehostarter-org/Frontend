"use client";

import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBookAirportPickupMutation } from "@/lib/api/riderApiSlice";
import { ArrowLeft, Navigation, Clock, CreditCard,  MapPin, Loader2, Users, Briefcase, ShieldCheck } from "lucide-react";

interface TripData {
  pickup: string;
  destination: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleImage?: string;
  plateNumber: string;
  price: number;
  duration: string;
  distance: string;
}

interface StepThreeProps {
  onNext?: () => void;
  tripData?: TripData;
}

const MOCK_TRIP: TripData = {
  pickup: "Murtala Muhammed International Airport, Lagos",
  destination: "Victoria Island, Lagos",
  vehicleType: "Sedan",
  vehicleModel: "Toyota Camry 2023",
  plateNumber: "ABC-123-NG",
  price: 15000,
  duration: "45 min",
  distance: "25 km",
};

export default function StepThreeDirections({ onNext, tripData = MOCK_TRIP }: StepThreeProps) {
  const router = useRouter();
  const [bookAirportPickup, { isLoading }] = useBookAirportPickupMutation();

  const handleContinue = async () => {
    try {
      const bookingData = {
        pickupLocation: tripData.pickup,
        destination: tripData.destination,
        vehicleType: tripData.vehicleType,
        price: tripData.price,
      };

      await bookAirportPickup(bookingData).unwrap();
      toast.success("Booking confirmed! Finding your driver...");
      onNext ? onNext() : router.push("/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/drivers-arrival");
    } catch (error) {
      toast.error("Failed to book. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full" onClick={() => router.back()} >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-full md:w-3/5 h-48 md:h-64 flex items-center justify-center">
              <Image
                src={tripData.vehicleImage || "/images/lexus.png"}
                alt={tripData.vehicleModel}
                width={500}
                height={300}
                className="object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-500"
              />
            </div>
            
            <div className="w-full md:w-2/5 space-y-4 text-center md:text-left">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                  Selected Ride
                </span>
                <h2 className="text-3xl font-black text-gray-900 mt-2">{tripData.vehicleType}</h2>
                <p className="text-gray-500 font-medium">{tripData.vehicleModel}</p>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <Users className="w-4 h-4" /> 4
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <Briefcase className="w-4 h-4" /> 2
                </div>
                <div className="px-2 py-1 bg-gray-900 text-white text-[10px] font-mono rounded">
                  {tripData.plateNumber}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-teal-600" /> Route Info
            </h3>
            
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full border-4 border-white bg-teal-500 shadow-sm" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</p>
                <p className="font-bold text-gray-800 line-clamp-1">{tripData.pickup}</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[22px] top-1 w-4 h-4 rounded-full border-4 border-white bg-gray-900 shadow-sm" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To</p>
                <p className="font-bold text-gray-800 line-clamp-1">{tripData.destination}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Fare</p>
                  <p className="text-3xl font-black text-gray-900">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(tripData.price)}
                  </p>
                </div>
                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">{tripData.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-teal-700">Insured Trip</span>
                </div>
              </div>
            </div>

            <Button onClick={handleContinue} disabled={isLoading} className="w-full mt-6 py-7 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl text-lg font-bold shadow-lg shadow-teal-900/10" >
              {isLoading ? <Loader2 className="animate-spin" /> : "Confirm Booking"}
            </Button>
          </div>
        </div>

        {/* 3. MINI MAP PREVIEW (Smaller now) */}
        <div className="relative w-full h-32 rounded-3xl overflow-hidden border border-gray-100 opacity-80 hover:opacity-100 transition-opacity">
          <Image src="/images/Location.png" alt="Map" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
          <div className="absolute left-6 top-1/2 -translate-y-1/2">
            <p className="text-xs font-bold text-gray-500">Route Preview</p>
            <p className="text-sm font-black text-gray-800">{tripData.distance} total distance</p>
          </div>
        </div>
      </div>
    </div>
  );
}