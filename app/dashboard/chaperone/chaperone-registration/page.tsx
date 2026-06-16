"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ChaperoneRegistrationForm, ChaperoneRegistrationData } from "./chaperone-registration-component"

interface UserLocation {
  country_code: string
  city: string
  ip: string
}

function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    setToken(storedToken)
  }, [])

  return token
}

function useUserLocation(token: string | null) {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    async function fetchLocation() {
      try {
        const detectRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/location/detect/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (detectRes.ok) {
          const locationData = await detectRes.json()
          setLocation({
            country_code: locationData.country_code || "NG",
            city: locationData.city || "Lagos",
            ip: locationData.ip || "",
          })
        } else {
          setLocation({ country_code: "NG", city: "Lagos", ip: "" })
        }
      } catch {
        setLocation({ country_code: "NG", city: "Lagos", ip: "" })
      } finally {
        setLoading(false)
      }
    }

    fetchLocation()
  }, [token])

  return { location, loading }
}

function useExistingChaperoneProfile(token: string | null) {
  const [isRegistered, setIsRegistered] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!token) {
      setChecking(false)
      return
    }

    async function checkProfile() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services/provider-profiles/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res.ok) {
          const data = await res.json()
          const profiles = Array.isArray(data) ? data : data.results || []
          const hasChaperone = profiles.some(
            (p: { service_type: string }) => p.service_type === "chaperone"
          )
          if (hasChaperone) {
            setIsRegistered(true)
          }
        }
      } catch {
        // silently fail
      } finally {
        setChecking(false)
      }
    }

    checkProfile()
  }, [token])

  return { isRegistered, checking }
}

const INITIAL_DATA: ChaperoneRegistrationData = {
  firstName: "",
  lastName: "",
  nationalIdentityNumber: "",
  emergencyContact: "",
  simCardReference: "",
  taxFileNumberReference: "",
  offersTranslationService: false,
}

export default function ChaperoneRegistrationPage() {
  const router = useRouter()
  const token = useAuthToken()
  const { location, loading: locationLoading } = useUserLocation(token)
  const { isRegistered, checking: checkingProfile } = useExistingChaperoneProfile(token)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ChaperoneRegistrationData>(INITIAL_DATA)

  const updateFormData = (field: keyof ChaperoneRegistrationData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!token) {
      toast.error("You must be logged in to register as a chaperone.")
      router.push("/login")
      return
    }

    if (!location) {
      toast.error("Unable to detect your location. Please refresh and try again.")
      return
    }

    const requiredFields = [
      "firstName", "lastName", "nationalIdentityNumber",
      "simCardReference", "taxFileNumberReference",
    ]

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof ChaperoneRegistrationData]
    )

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`)
      return
    }

    setIsSubmitting(true)

    try {
      const profileFormData = new FormData()
      profileFormData.append("service_type", "chaperone")
      profileFormData.append("country_code", location.country_code)
      profileFormData.append("city", location.city)

      profileFormData.append("first_name", formData.firstName)
      profileFormData.append("last_name", formData.lastName)
      profileFormData.append("national_identity_number", formData.nationalIdentityNumber)
      if (formData.emergencyContact) {
        profileFormData.append("emergency_contact", formData.emergencyContact)
      }
      profileFormData.append("sim_card_reference", formData.simCardReference)
      profileFormData.append("tax_file_number_reference", formData.taxFileNumberReference)
      profileFormData.append("offers_translation_service", formData.offersTranslationService ? "true" : "false")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/provider-profiles/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: profileFormData,
        }
      )

      const responseText = await response.text()
      let responseData
      try {
        responseData = responseText ? JSON.parse(responseText) : {}
      } catch {
        responseData = { detail: responseText || "No error details" }
      }

      if (!response.ok) {
        const isDuplicate = response.status === 400 &&
          (JSON.stringify(responseData).toLowerCase().includes("unique") ||
            JSON.stringify(responseData).toLowerCase().includes("already exists") ||
            JSON.stringify(responseData).toLowerCase().includes("duplicate"))

        if (isDuplicate) {
          toast.info("You're already registered as a chaperone!")
          router.push("/dashboard/chaperone")
          return
        }

        if (responseData.detail) {
          toast.error(responseData.detail)
        } else if (typeof responseData === "object") {
          const errorMessages = Object.entries(responseData)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")
          toast.error(errorMessages || "Failed to register as chaperone")
        } else {
          toast.error("Failed to register as chaperone. Please check your details.")
        }
        return
      }

      toast.success("Successfully registered as a chaperone!")
      router.push("/dashboard/chaperone")

    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (locationLoading || checkingProfile) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl border border-gray-300 p-8 lg:p-12 shadow-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isRegistered) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl border border-gray-300 p-8 lg:p-12 shadow-sm text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Already Registered</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You've already signed up as a chaperone. You can now receive booking requests from users.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard/chaperone")}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Go to Chaperone Dashboard
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-gray-300 p-8 lg:p-12 shadow-sm">
        {location && (
          <div className="mb-6 p-3 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-sm text-teal-800">
              Registering as a chaperone in: <strong>{location.city}, {location.country_code}</strong>
            </p>
          </div>
        )}

        <ChaperoneRegistrationForm
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
  )
}
