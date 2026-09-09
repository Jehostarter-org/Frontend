"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import {
  useUpdateUserProfileMutation,
  useSaveGeolocationMutation,
} from "@/lib/api/userProfileApiSlice";
import { useAuth } from "@/components/contexts/auth-context";

export default function LocationSection() {
  const { user } = useAuth();
  const { requestLocation, isLocating, location, error } = useGeolocation();

  // PATCH /api/users/me/ with { current_country, city }
  const [updateUserProfile, { isLoading: isSavingProfile }] = useUpdateUserProfileMutation();
  // POST /api/users/location/ with the live GPS coordinates
  const [saveGeolocation, { isLoading: isSavingGeo }] = useSaveGeolocationMutation();

  const isLoading = isLocating || isSavingProfile || isSavingGeo;

  const handleUpdateLocation = async () => {
    // Force a fresh GPS read every time — never reuse the cached (stale) location
    const data = await requestLocation(true);

    if (!data) {
      toast.error("Could not get location", {
        description: error ?? "Please allow location access and try again.",
      });
      return;
    }

    // GPS was denied/unavailable → only a profile fallback came back (no real coords)
    const hasRealCoords =
      Number.isFinite(data.lat) &&
      Number.isFinite(data.lng) &&
      (data.lat !== 0 || data.lng !== 0);

    if (!hasRealCoords) {
      toast.error("Could not fetch your current location", {
        description: "Allow location access in your browser, then tap Update again.",
      });
      return;
    }

    let saved = false;

    // 1) Send the live GPS coordinates to the backend
    try {
      await saveGeolocation({ latitude: data.lat, longitude: data.lng }).unwrap();
      saved = true;
    } catch (err) {
      console.error("Failed to save geolocation:", err);
    }

    // 2) Sync the reverse-geocoded country + city onto the profile
    try {
      await updateUserProfile({
        current_country: data.country_code || user?.currentCountry,
        city: data.city || user?.city,
      }).unwrap();
      saved = true;
    } catch (err) {
      console.error("Failed to save profile location:", err);
    }

    if (saved) {
      toast.success("Location updated", {
        description: data.address,
      });
    } else {
      toast.error("Failed to save location to your profile.");
    }
  };

  const addressToDisplay =
    location?.address ||
    (user?.currentCountry
      ? user.currentCountry
      : "Click to set your location");

  const lastUpdated = user?.currentCountry
    ? `Based on your profile — ${user.currentCountry}`
    : null;

  return (
    <div className="mt-4 sm:mt-6">
      <Button
        onClick={handleUpdateLocation}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors",
          "bg-amber-50 hover:bg-teal-200 hover:text-teal-800 disabled:opacity-70 disabled:cursor-not-allowed group"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-teal-700 animate-spin" />
        ) : (
          <MapPin className="w-4 h-4 text-teal-700 group-hover:scale-110 transition-transform" />
        )}
        <span>Current Location</span>
        {!isLoading && (
          <span className="text-[10px] text-teal-600 font-normal opacity-0 group-hover:opacity-100 transition-opacity">
            (Update)
          </span>
        )}
      </Button>

      <div className="mt-2 pl-6">
        <p
          className={cn(
            "text-sm break-words",
            addressToDisplay === "Click to set your location"
              ? "text-gray-400 italic"
              : "text-gray-700"
          )}
        >
          {addressToDisplay}
        </p>
        {lastUpdated && (
          <p className="text-[10px] text-gray-400 mt-1">{lastUpdated}</p>
        )}
      </div>
    </div>
  );
}