"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, UserCheck } from "lucide-react"

const HELP_TYPES = [
  { value: "sim_card", label: "SIM Card Reference" },
  { value: "tax_file", label: "Tax File Number Reference" },
  { value: "registration", label: "All Forms of Registration" },
  { value: "translation", label: "Translation Service" },
]

interface ChaperoneProfile {
  id: string
  first_name: string
  last_name: string
  city: string
  country_code: string
  offers_translation_service: boolean
  sim_card_reference: string
  tax_file_number_reference: string
  full_name: string
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

export default function BookChaperonePage() {
  const router = useRouter()
  const token = useAuthToken()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chaperones, setChaperones] = useState<ChaperoneProfile[]>([])
  const [loadingChaperones, setLoadingChaperones] = useState(true)

  const [formData, setFormData] = useState({
    helpType: "registration",
    location: "",
    description: "",
    notes: "",
    selectedChaperoneId: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (!token) {
      setLoadingChaperones(false)
      return
    }

    async function fetchChaperones() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services/chaperones/available/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data) ? data : data.results || []
          setChaperones(list)
        }
      } catch {
        // silently fail
      } finally {
        setLoadingChaperones(false)
      }
    }

    fetchChaperones()
  }, [token])

  const handleSubmit = async () => {
    if (!token) {
      toast.error("You must be logged in to book a chaperone.")
      router.push("/login")
      return
    }

    if (!formData.location) {
      toast.error("Please enter your location.")
      return
    }

    setIsSubmitting(true)

    try {
      const selectedHelp = HELP_TYPES.find((h) => h.value === formData.helpType)
      const description = [
        `Help needed: ${selectedHelp?.label || formData.helpType}`,
        formData.description && `Details: ${formData.description}`,
      ].filter(Boolean).join("\n")

      const payload = {
        service_type: "chaperone",
        description,
        country_code: "NG",
        city: formData.location,
        notes: formData.notes,
        chaperone_details: {
          help_type: formData.helpType,
          location: formData.location,
        },
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/services/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
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
        if (responseData.detail) {
          toast.error(responseData.detail)
        } else {
          toast.error("Failed to submit booking request.")
        }
        return
      }

      const serviceId = responseData.id

      // ── Broadcast to chaperones ─────────────────────────────────────
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}/broadcast-chaperone/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      } catch (broadcastError) {
        console.error("Broadcast failed (non-critical):", broadcastError)
      }

      toast.success("Chaperone service request submitted successfully!")
      router.push("/dashboard/chaperone")

    } catch (error) {
      console.error("Booking error:", error)
      toast.error(error instanceof Error ? error.message : "Booking failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="py-1">
        <Button
          variant="ghost"
          className="mb-6 bg-gray-200 hover:bg-gray-400 text-gray-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-300 p-8 lg:p-12 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900">
          Book Chaperone Services
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Request assistance with registrations, tax filings, and more.
        </p>

        <div className="space-y-8">
          {/* Section 1: Help Type */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">1</span>
              <h3 className="font-semibold text-gray-900">What do you need help with?</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HELP_TYPES.map((help) => (
                <button
                  key={help.value}
                  type="button"
                  onClick={() => updateField("helpType", help.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.helpType === help.value
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.helpType === help.value ? "border-teal-500" : "border-gray-300"
                    }`}>
                      {formData.helpType === help.value && (
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                      )}
                    </div>
                    <span className="font-medium text-sm">{help.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: Location & Details */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">2</span>
              <h3 className="font-semibold text-gray-900">Location & Details</h3>
            </div>

            <div className="space-y-2">
              <Label>Your Location / City <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g., Lagos, Abuja"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what you need help with..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any special requirements or notes..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </section>

          {/* Available Chaperones */}
          {!loadingChaperones && chaperones.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                  <UserCheck className="w-3 h-3" />
                </span>
                <h3 className="font-semibold text-gray-900">Available Chaperones ({chaperones.length})</h3>
              </div>
              <p className="text-sm text-gray-500">
                Your request will be sent to {chaperones.length} available chaperone(s) in your area.
              </p>
            </section>
          )}

          {loadingChaperones && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Finding available chaperones...</p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="px-6 py-3"
          >
            Back
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </div>
  )
}
