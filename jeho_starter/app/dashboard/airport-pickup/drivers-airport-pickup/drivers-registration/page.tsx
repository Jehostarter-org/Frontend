"use client"

import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadToCloudinary } from "@/lib/upload-utils";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useRegisterDriverMutation } from "@/lib/api/airportPickupApiSlice";
import { driverRegistrationSchema, DriverFormData } from "@/components/types/schemas/driver-scehma";
import { StepTwoRegistration } from "@/components/dashboard/airport-pickup/drivers-pickup/driver-pickup-registration";

export default function DriversRegistration() {
  const router = useRouter();
  const [registerDriver] = useRegisterDriverMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      nationalIdentityNumber: "",
      emergencyContact: "",
      licenseNumber: "",
      licenseStateCountry: "",
      licenseExpirationDate: "",
      licensePlateNumber: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleColour: "",
      vin: "",
      driverLicenseImage: null,
      frontViewPicture: null,
      backViewPicture: null,
      plateNumberBackViewPicture: null,
      plateNumberFrontViewPicture: null,
    },
    mode: "onChange"
  });

  const currentData = form.watch();

  const handleUpdate = (field: keyof DriverFormData, value: string | File | null) => {
    form.setValue(field, value, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true);
    try {
      console.log("1. Starting Image Uploads...");
      const imageFields = [
        { key: 'driverLicenseImage', file: data.driverLicenseImage },
        { key: 'frontViewPicture', file: data.frontViewPicture },
        { key: 'backViewPicture', file: data.backViewPicture },
        { key: 'plateNumberBackViewPicture', file: data.plateNumberBackViewPicture },
        { key: 'plateNumberFrontViewPicture', file: data.plateNumberFrontViewPicture },
      ];

      const payload: Record<string, any> = { ...data };

      delete payload.driverLicenseImage;
      delete payload.frontViewPicture;
      delete payload.backViewPicture;
      delete payload.plateNumberFrontViewPicture;
      delete payload.plateNumberBackViewPicture;

      Object.keys(payload).forEach((key) => {
        if ( payload[key] && typeof payload[key] === 'object' && payload[key].value !== undefined ) {
          console.log(`Fixing field '${key}':`, payload[key], "->", payload[key].value);
          payload[key] = payload[key].value;
        }
      });

      if (payload.vehicleType && payload.vehicleType.value) { payload.vehicleType = payload.vehicleType.value; }
      if (payload.gender && payload.gender.value) { payload.gender = payload.gender.value; }
      if (payload.state && payload.state.value) { payload.state = payload.state.value; }

      const uploadResults = await Promise.all(
        imageFields.map(async (item) => {
          if (item.file instanceof File) { 
            const url = await uploadToCloudinary(item.file);
            return { key: item.key, url };
          }
          return { key: item.key, url: null };
        })
      );
      
      uploadResults.forEach((result) => {
        if (result.url) {
          payload[result.key] = result.url;
        }
      });

      console.log("2. Sending to Backend:", payload);

      await registerDriver(payload).unwrap();

      toast.success("Driver registration successful!");
      router.push("/dashboard/airport-pickup/drivers-airport-pickup");

    } catch (error) {
      console.error("Submission failed", error);
      toast.error((error as any)?.data?.message || "Registration failed. Please check your network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto p-5 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="py-1">
          <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm px-5 py-10 lg:p-12">
          <div className="mb-8 max-w-md mx-auto">
            <div className="w-full bg-gray-100 rounded-full h-2 mb-5 overflow-hidden">
            <div className="bg-[#2d7a7a] h-full rounded-full transition-all duration-500 ease-out" style={{ width: "100%" }} />
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            
            <StepTwoRegistration data={currentData} onUpdate={handleUpdate} />

            <div className="flex justify-center mt-10">
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full max-w-sm bg-[#2d4a53] hover:bg-[#243a42] text-white py-6 text-base font-medium shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" size="lg" >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
            
            {Object.keys(form.formState.errors).length > 0 && (
              <p className="text-center text-red-500 text-sm mt-4">
                Please fill in all required fields and upload all images.
              </p>
            )}
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
