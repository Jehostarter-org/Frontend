"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import location from "@/public/images/Location.png";
import ProtectedRoute from "@/components/auth/page";
import logo from "@/public/images/big logo BLACK.png";
import { useSaveGeolocationMutation } from "@/lib/api/userProfileApiSlice";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  error: string | null;
}

export default function LocationPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveGeolocation, {isLoading}] = useSaveGeolocationMutation();
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: null,
    longitude: null,
    address: null,
    error: null
  });


  const handleGetAndSaveLocation = async () => {
    setIsProcessing(true);
    setLocationData(prev => ({ ...prev, error: null }));

    if (!navigator.geolocation) {
      const errorMessage = "Geolocation is not supported by this browser.";
      setLocationData(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      setIsProcessing(false);
      return;
    }

    const successCallback = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      let address: string | null = null;

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        if (data && data.city && data.countryName) {
          address = `${data.city}, ${data.countryName}`;
        }
        setLocationData({latitude, longitude, address, error: null });

      } catch (error) {
        console.log("Could not get address, but coordinates are available:", error);
        console.warn("Could not fetch address, will use coordinates as fallback.", error);
      }
      
      // Now save the location to backend
      try {
        const locationPayload = {
          latitude,
          longitude,
          address: address || `${latitude}, ${longitude}`,
          timestamp: new Date().toISOString()
        };

        console.log('Sending geolocation payload:', locationPayload); // Debug log

        await saveGeolocation(locationPayload).unwrap();

        toast.success("Location saved successfully!", {
          description: "Redirecting to the next step...",
        });
        
        setTimeout(() => {
          router.push("");
        }, 3000);    
      } catch (err) {
        console.error("Failed to save location to the backend:", err);
        let errorMessages = "Failed to save location. Please try again.";
        if (typeof err === 'object' && err !== null && 'data' in err) {
          const errorData = (err as { data?: { message?: string } }).data;
          if (errorData && typeof errorData.message === 'string') {
            errorMessages = errorData.message;
          }
        }
        toast.error(errorMessages);
      } finally {
        setIsProcessing(false);
      }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = "An unknown error occurred while getting your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
          errorMessage = "You have denied access to your location. Please enable it in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Your location information is currently unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get your location timed out.";
          break;
      }    
      setLocationData(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);

      setIsProcessing(false);
    }
  
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white flex flex-col">
        <div className='absolute top-10 left-25 sm:top-10 sm:left-10 px-10 sm:px-10'>
          <Image src={logo} alt='logo' className='w-full h-40' />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
          <div className="w-full max-w-2xl">
            <Image
              src={location}
              alt="Location confirmation illustration"
              width={600}
              height={400}
              className="w-full h-auto"
              priority
            />
            {locationData.address && !locationData.error && (
              <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
                Location: {locationData.address}
              </div>
            )}
          </div>
        
          <div className="mx-auto bg-white">
            <Button
              onClick={handleGetAndSaveLocation}
              disabled={isLoading || isProcessing}
              className='w-full h-12 bg-teal-900 hover:bg-teal-800 sm:px-40 px-20 text-white font-medium disabled:opacity-50'
            >
              {isProcessing ? "Getting Location..." : (isLoading ? "Saving..." : "Confirm Location")}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
