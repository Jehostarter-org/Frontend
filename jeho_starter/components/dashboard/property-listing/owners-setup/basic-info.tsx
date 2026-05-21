"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import FormSection from "../../form-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { PROPERTY_TYPES } from "@/lib/property-constant";
import { ArrowLeft, Loader2, Building2, MapPin } from "lucide-react";
import { ownerStep1Schema, OwnerStep1Values } from "@/components/types/schemas/property-scehma";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useCreatePropertyMutation } from "@/lib/api/propertyApiSlice";


interface OwnerStep1Props {
  onNext: (data: OwnerStep1Values) => void;
  onBack: () => void;
  initialData: Partial<OwnerStep1Values>;
}

export default function BasicInfoStep({ onNext, onBack, initialData }: OwnerStep1Props) {
  // const [createProperty, { isLoading: isPosting }] = useCreatePropertyMutation();

  const defaultValues = useMemo(() => ({
    propertyTitle: initialData.propertyTitle || "",
    propertyType: initialData.propertyType || "",
    rentalType: initialData.rentalType || "",
    description: initialData.description || "",
    address: initialData.address || "",
    nearestLandmark: initialData.nearestLandmark || "",
    city: initialData.city || "",
    state: initialData.state || "",
  }), [initialData]);

  const form = useForm<OwnerStep1Values>({
    resolver: zodResolver(ownerStep1Schema),
    defaultValues,
    mode: "onTouched", 
  });

  const onSubmit = async (data: OwnerStep1Values) => {
    try {
      onNext(data);
    } catch (error) {
      console.error("Failed to sync property info:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500" >
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-200 p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" type="button" onClick={onBack} className="h-10 w-10 p-0 rounded-full hover:bg-white hover:shadow-sm transition-all" >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">List your Property</h2>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Step 1: Basic Details</p>
              </div>
            </div>
            <div className="hidden sm:block">
               <Building2 className="w-8 h-8 text-teal-600 " />
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-10">
            <FormSection title="Property Details" description="Basic information about the apartment or house." >
              <div className="md:flex grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-10">
                <FormField
                  control={form.control}
                  name="propertyTitle"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>Property Title</FormLabel>
                      <FormControl className="h-11 py-5 mb-5 md:mb-0">
                        <Input placeholder="Luxury 2 Bedroom Apartment" {...field} className="h-11 px-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>Property Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="justify-start mb-5 md:mb-0">
                          <SelectTrigger className="h-11 px-12 py-5">
                            <SelectValue placeholder="Select property type"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="bg-teal-200">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rentalType"
                  render={({ field }) => (
                    <FormItem className="lg:col-span-2">
                      <FormLabel>Rental Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 px-12 py-5">
                            <SelectValue placeholder="Select rental duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-teal-200">
                          <SelectItem value="short-term">Short Term (Daily/Weekly)</SelectItem>
                          <SelectItem value="long-term">Long Term (Yearly)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 lg:col-span-3">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell tenants what makes your place special..." className="resize-none min-h-[120px] focus:ring-teal-500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </FormSection>

            <FormSection title="Location Details" description="Help tenants find your property easily." >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input placeholder="123 Example Street, Area" {...field} className="pl-10 h-11" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nearestLandmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nearest Landmark</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Near Shoprite Mall" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Lagos" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Lagos State" {...field} className="h-11" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FormSection>
          </div>
        </div>

        <div className="flex items-center justify-end bg-gray-100 p-4 gap-6">
          <Button type="button" variant="ghost" onClick={onBack} className="text-black border px-6 py-5 hover:bg-gray-200" >
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button type="submit" 
            // disabled={isPosting} 
            className="bg-teal-600 hover:bg-teal-700 text-white px-10 h-11 shadow-sm transition-all" >
              {/* {isPosting ? ( <>  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...  </> ) : (  "Next"  )} */}Next
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}