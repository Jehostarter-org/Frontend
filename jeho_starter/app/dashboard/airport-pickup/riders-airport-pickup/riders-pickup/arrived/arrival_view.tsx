"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";



export interface ArrivalViewProps {
  onNext: () => void;
  onBack?: () => void; 
  destinationName?: string;
}

export default function ArrivalView({ 
  onNext, 
  onBack, 
  destinationName = "your destination" 
}: ArrivalViewProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center">
        <Button variant="ghost" onClick={handleBack} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-4" >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-6">
        <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 group">
          <Image
            src="/images/Location.png"
            alt="Map showing destination arrival"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          />

          <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/5">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl px-8 py-10 shadow-2xl max-w-sm w-full text-center border border-white/50 relative overflow-hidden">
              
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
                    <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
                    </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  You have arrived
                </h2>
                <p className="text-gray-500 text-sm sm:text-base font-medium">
                  Welcome to {destinationName}
                </p>
              </div>

            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={onNext} className="w-full h-14 text-lg font-semibold bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/20 rounded-xl transition-all hover:-translate-y-0.5" >
            Complete & Rate Trip
          </Button>
        </div>

      </div>
    </div>
  );
}