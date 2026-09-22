"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/contexts/auth-context"
import { useEffect } from "react"

export interface ChaperoneRegistrationData {
  firstName: string
  lastName: string
  nationalIdentityNumber: string
  emergencyContact: string
  simCardReference: string
  taxFileNumberReference: string
  offersTranslationService: boolean
  offersRegistrationService: boolean
  isImmigrationOfficer: boolean
  phoneNumber: string
  homeBaseAddress: string
}

interface ChaperoneRegistrationFormProps {
  data: ChaperoneRegistrationData
  onUpdate: (field: keyof ChaperoneRegistrationData, value: string | boolean) => void
}

export function ChaperoneRegistrationForm({ data, onUpdate }: ChaperoneRegistrationFormProps) {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      if (!data.firstName && user.firstName) onUpdate("firstName", user.firstName)
      if (!data.lastName && user.lastName) onUpdate("lastName", user.lastName)
    }
  }, [user, data.firstName, data.lastName, onUpdate])

  const handleInput = (key: keyof ChaperoneRegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(key, e.target.value)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900">
        Chaperone Registration
      </h2>
      <p className="text-center text-gray-500 mb-8 text-sm">
        Fill in your details to register as a chaperone and start helping immigrants.
      </p>

      <div className="space-y-8">
        {/* Section 1: Personal Information */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">1</span>
            <h3 className="font-semibold text-gray-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="First name"
                value={data.firstName}
                onChange={handleInput("firstName")}
                className="h-12 bg-gray-50/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Last name"
                value={data.lastName}
                onChange={handleInput("lastName")}
                className="h-12 bg-gray-50/50"
              />
            </div>
            <div className="space-y-2">
              <Label>National ID <span className="text-red-500">*</span></Label>
              <Input
                placeholder="National ID Number"
                value={data.nationalIdentityNumber}
                onChange={handleInput("nationalIdentityNumber")}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input
                placeholder="Phone Number"
                value={data.emergencyContact}
                onChange={handleInput("emergencyContact")}
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Home Base Address <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g., 45 Adeola Odeku Street, Victoria Island, Lagos"
              value={data.homeBaseAddress}
              onChange={handleInput("homeBaseAddress")}
              className="h-12"
            />
            <p className="text-xs text-gray-400">Your street address so customers know where you're based</p>
          </div>
        </section>

        {/* Section 2: Chaperone Documentation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">2</span>
            <h3 className="font-semibold text-gray-900">Registration Documents</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>SIM Card Reference <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="SIM card registration reference number"
                  value={data.simCardReference}
                  onChange={handleInput("simCardReference")}
                  className="h-12"
                />
                <p className="text-xs text-gray-400">Enter the reference number from your SIM card registration</p>
              </div>
              <div className="space-y-2">
                <Label>Phone Number <span className="text-red-500">*</span></Label>
                <Input
                  type="tel"
                  placeholder="Your contact phone number"
                  value={data.phoneNumber}
                  onChange={handleInput("phoneNumber")}
                  className="h-12"
                />
                <p className="text-xs text-gray-400">Your phone number so customers can reach you</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tax File Number Reference <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Tax File Number (TFN) reference"
                value={data.taxFileNumberReference}
                onChange={handleInput("taxFileNumberReference")}
                className="h-12"
              />
              <p className="text-xs text-gray-400">Your Tax File Number (TFN) reference for tax purposes</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mt-4">
            <Checkbox
              id="offersTranslationService"
              checked={data.offersTranslationService}
              onCheckedChange={(checked) => onUpdate("offersTranslationService", checked === true)}
              className="mt-1"
            />
            <div>
              <Label htmlFor="offersTranslationService" className="font-medium text-gray-900 cursor-pointer">
                I can provide Translation Services
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Check this if you are able to offer translation services in addition to chaperone assistance.
                This can include translating documents, interpreting conversations, and helping with forms.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mt-3">
            <Checkbox
              id="offersRegistrationService"
              checked={data.offersRegistrationService}
              onCheckedChange={(checked) => onUpdate("offersRegistrationService", checked === true)}
              className="mt-1"
            />
            <div>
              <Label htmlFor="offersRegistrationService" className="font-medium text-gray-900 cursor-pointer">
                I can help with All Forms of Registration
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Check this if you can assist with various registration processes (government, school, medical, etc.).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mt-3">
            <Checkbox
              id="isImmigrationOfficer"
              checked={data.isImmigrationOfficer}
              onCheckedChange={(checked) => onUpdate("isImmigrationOfficer", checked === true)}
              className="mt-1"
            />
            <div>
              <Label htmlFor="isImmigrationOfficer" className="font-medium text-gray-900 cursor-pointer">
                I am an Immigration Officer
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                Check this if you are currently or have previously worked as an
                immigration officer and can help immigrants with their
                immigration-related processes and paperwork.
              </p>
            </div>
          </div>
        </section>

        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            By registering as a chaperone, you agree to help immigrants with their registration process,
            paperwork, and other related services. Your information will be verified before activation.
          </p>
        </div>
      </div>
    </div>
  )
}
