// app/dashboard/airport-pickup/drivers-airport-pickup/drivers-registration/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { StepTwoRegistration, RegistrationData } from "./driver-pickup-registration";

interface UserLocation {
  country_code: string;
  city: string;
  ip: string;
}

// Hook to get token from localStorage
function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token') ||
      localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  return token;
}

// Hook to get user location from backend
function useUserLocation(token: string | null) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchLocation() {
      try {
        // Try to detect location first
        const detectRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/location/detect/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (detectRes.ok) {
          const locationData = await detectRes.json();
          console.log("Detected location:", locationData);
          setLocation({
            country_code: locationData.country_code || "AU",
            city: locationData.city || "Lagos",
            ip: locationData.ip || "",
          });
        } else {
          // Fallback to default
          setLocation({
            country_code: "AU",
            city: "Sydney",
            ip: "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch location:", err);
        setError("Could not detect location");
        // Set default location
        setLocation({
          country_code: "AU",
          city: "Sydney",
          ip: "",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchLocation();
  }, [token]);

  return { location, loading, error };
}

const INITIAL_REGISTRATION_DATA: RegistrationData = {
  firstName: "",
  lastName: "",
  emergencyContact: "",
  nationalIdentityNumber: "",
  licenseNumber: "",
  licensePlateNumber: "",
  licenseStateCountry: "",
  licenseExpirationDate: "",
  vehicleModel: "",
  vehicleYear: "",
  vehicleColour: "",
  vin: "",
  driverLicenseImage: null,
  frontViewPicture: null,
  backViewPicture: null,
  sideViewPicture: null,
  interiorPicture: null,
  plateNumberFrontViewPicture: null,
  plateNumberBackViewPicture: null,
};

// Hook to check if user already has a driver profile
function useExistingDriverProfile(token: string | null) {
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }

    async function checkProfile() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services/provider-profiles/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const profiles = Array.isArray(data) ? data : data.results || [];
          const driverProfile = profiles.find(
            (p: { service_type: string }) => p.service_type === "airport_pickup"
          );
          if (driverProfile) {
            setProfileStatus(driverProfile.approval_status || "approved");
            if (driverProfile.approval_status === "rejected") {
              setRejectionReason(driverProfile.rejection_reason || null);
            }
          }
        }
      } catch {
        // Silently fail — show the form so they can try registering
      } finally {
        setChecking(false);
      }
    }

    checkProfile();
  }, [token]);

  return { profileStatus, rejectionReason, checking };
}

export default function DriversRegistrationPage() {
  const router = useRouter();
  const token = useAuthToken();
  const { location, loading: locationLoading } = useUserLocation(token);
  const { profileStatus, rejectionReason, checking: checkingProfile } = useExistingDriverProfile(token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>(INITIAL_REGISTRATION_DATA);

  const updateFormData = (field: keyof RegistrationData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error("You must be logged in to register as a driver.");
      router.push("/login");
      return;
    }

    if (!location) {
      toast.error("Unable to detect your location. Please refresh and try again.");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "firstName", "lastName", "nationalIdentityNumber",
      "licenseNumber", "licensePlateNumber", "licenseStateCountry",
      "licenseExpirationDate", "vehicleModel", "vehicleYear", "vehicleColour"
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof RegistrationData]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const bio = [
        formData.vehicleModel,
        formData.vehicleYear,
        formData.vehicleColour,
        formData.licensePlateNumber,
      ].filter(Boolean).join(" · ");

      // Create FormData for multipart upload
      const profileFormData = new FormData();
      profileFormData.append("service_type", "airport_pickup");
      profileFormData.append("bio", bio);

      // Add location data from detection
      profileFormData.append("country_code", location.country_code);
      profileFormData.append("city", location.city);

      // Add all form data fields
      if (formData.firstName) profileFormData.append("first_name", formData.firstName);
      if (formData.lastName) profileFormData.append("last_name", formData.lastName);
      if (formData.nationalIdentityNumber) profileFormData.append("national_identity_number", formData.nationalIdentityNumber);
      if (formData.emergencyContact) profileFormData.append("emergency_contact", formData.emergencyContact);
      if (formData.licenseNumber) profileFormData.append("license_number", formData.licenseNumber);
      if (formData.licenseStateCountry) profileFormData.append("license_state_country", formData.licenseStateCountry);
      if (formData.licenseExpirationDate) profileFormData.append("license_expiration_date", formData.licenseExpirationDate);
      if (formData.vehicleModel) profileFormData.append("vehicle_model", formData.vehicleModel);
      if (formData.vehicleYear) profileFormData.append("vehicle_year", formData.vehicleYear);
      if (formData.vehicleColour) profileFormData.append("vehicle_colour", formData.vehicleColour);
      if (formData.licensePlateNumber) profileFormData.append("license_plate_number", formData.licensePlateNumber);
      if (formData.vin) profileFormData.append("vin", formData.vin);

      // Add files
      if (formData.driverLicenseImage instanceof File) {
        profileFormData.append("driver_license_image", formData.driverLicenseImage);
      }
      if (formData.frontViewPicture instanceof File) {
        profileFormData.append("front_view_picture", formData.frontViewPicture);
      }
      if (formData.backViewPicture instanceof File) {
        profileFormData.append("back_view_picture", formData.backViewPicture);
      }
      if (formData.sideViewPicture instanceof File) {
        profileFormData.append("side_view_picture", formData.sideViewPicture);
      }
      if (formData.interiorPicture instanceof File) {
        profileFormData.append("interior_picture", formData.interiorPicture);
      }
      if (formData.plateNumberFrontViewPicture instanceof File) {
        profileFormData.append("plate_number_front_view_picture", formData.plateNumberFrontViewPicture);
      }
      if (formData.plateNumberBackViewPicture instanceof File) {
        profileFormData.append("plate_number_back_view_picture", formData.plateNumberBackViewPicture);
      }

      console.log("Sending registration with location:", location.country_code, location.city);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/provider-profiles/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: profileFormData,
        }
      );

      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response body:", responseText);

      let errorData;
      try {
        errorData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        errorData = { detail: responseText || "No error details provided" };
      }

      if (!response.ok) {
        console.error("Registration error details:", errorData);

        // Check if already registered
        const isDuplicate = response.status === 400 &&
          (JSON.stringify(errorData).toLowerCase().includes("unique") ||
            JSON.stringify(errorData).toLowerCase().includes("already exists") ||
            JSON.stringify(errorData).toLowerCase().includes("duplicate"));

        if (isDuplicate) {
          toast.info("You're already registered as a driver!");
          router.push("/dashboard");
          return;
        }

        // Show specific error messages
        if (errorData.detail) {
          toast.error(errorData.detail);
        } else if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          toast.error(errorMessages || "Failed to register as driver");
        } else {
          toast.error("Failed to register as driver. Please check your details.");
        }
        return;
      }

      const profileData = errorData;
      console.log("Registration successful:", profileData);

      toast.success("Registration submitted! Your application is pending admin approval.");
      router.push("/dashboard");

    } catch (error) {
      console.error("Registration fetch error:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state while checking profile and location
  if (locationLoading || checkingProfile) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl border border-gray-300 p-8 lg:p-12 shadow-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Already registered or pending approval state
  if (profileStatus && profileStatus !== "rejected") {
    const isPending = profileStatus === "pending";
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl border border-gray-300 p-8 lg:p-12 shadow-sm text-center">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isPending ? 'bg-amber-50' : 'bg-teal-50'}`}>
            {isPending ? (
              <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          {isPending ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Pending Approval</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Your driver registration has been submitted and is awaiting admin approval.
                You'll be notified once your application has been reviewed.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Already Registered</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You've already signed up as a driver. Head to your available rides to start accepting pickup requests.
              </p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-gray-300 p-8 lg:p-12 shadow-sm">
        {/* Rejection banner */}
        {profileStatus === "rejected" && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-red-800">Your previous application was rejected</p>
                {rejectionReason && (
                  <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
                )}
                <p className="text-sm text-red-600 mt-2">Please update your details below and submit again.</p>
              </div>
            </div>
          </div>
        )}

        {/* Show location info */}
        {location && (
          <div className="mb-6 p-3 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-sm text-teal-800">
              📍 Registering as a driver in: <strong>{location.city}, {location.country_code}</strong>
            </p>
          </div>
        )}

        <StepTwoRegistration
          data={formData}
          onUpdate={updateFormData}
        />

        <div className="flex justify-between mt-12">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registering..." : "Complete Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}