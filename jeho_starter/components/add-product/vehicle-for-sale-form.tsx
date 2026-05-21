"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { uploadToCloudinary } from "@/lib/upload-utils";
import { useCurrency } from "../contexts/currencyContext";
import { useAuth } from "@/components/contexts/auth-context";
import { useAddProductMutation } from "@/lib/api/productsApiSlice";
import { ProductImageUploader } from "@/components/reuseables/product-image-uploader";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { vehicleSchema, VehicleFormData, VEHICLE_CATEGORIES, VEHICLE_CONDITIONS } from "@/components/reuseables/vehicle-stats";


export default function VehicleForSalePage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addVehicle] = useAddProductMutation();
  const { currency } = useCurrency();
  const currencySymbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€" };
  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      title: "",
      price: 0,
      category: "",
      productCondition: "",
      brand: "",
      availability: "IN_STOCK",
      productLimit: 1,
      location: "",
      description: "",
      meetupPreference: "",
      productImages: [],
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      const uploadPromises = data.productImages.map((file) => file instanceof File ? uploadToCloudinary(file) : Promise.resolve(file) );
      const imageUrls = await Promise.all(uploadPromises);
      const payload = {
        ...data,
        category: "VEHICLE", 
        subCategory: data.category, 
        productImages: imageUrls,
        price: Number(data.price),
      };

      await addVehicle(payload).unwrap();
      toast.success("Vehicle listed successfully!");
      form.reset();
    } catch (error: any) {
      const msg = error?.data?.message || "Failed to list vehicle.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">List Vehicle for Sale</h2>
          <Button variant="outline" onClick={() => form.reset()} type="button">
            Clear Form
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="productImages"
                render={({ field }) => (
                  <ProductImageUploader 
                    value={field.value} 
                    onChange={field.onChange} 
                    error={form.formState.errors.productImages?.message} 
                  />
                )}
              />
              <Card className="p-4 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                  <Image src={user?.picture || "/images/photo3.png"} alt={`${user?.firstName || 'User'}'s profile`} fill className="object-cover" />
                </div>
                <div className="text-center text-lg">
                  <h4 className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h4>
                  <p className="text-xs text-muted-foreground text-center">Verified Seller</p>
                </div>  
              </Card>
            </div>

            <Card className="lg:col-span-2 p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Vehicle Name</FormLabel>
                      <FormControl><Input placeholder="e.g. 2022 Toyota Camry" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between items-end">
                        <span>Price ({currency})</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter bg-gray-100 px-1.5 py-0.5 rounded">
                          Sync: Real-time
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold transition-colors group-focus-within:text-teal-600">
                            {currencySymbols[currency] || ""}
                          </div>
                          <Input type="number" placeholder="0.00" className="pl-9 h-11 border-gray-200 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all font-semibold"
                            value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {VEHICLE_CATEGORIES.map(cat => ( <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem> ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="e.g. Lekki, Lagos" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[120px]" placeholder="Engine specs, mileage, etc..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-800 hover:bg-teal-900 text-white h-12 text-lg" >
                    {isSubmitting ? ( <>  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...  </> ) : ( "Publish Vehicle" )}
                </Button>
            </Card>

          </form>
        </Form>
      </div>
  );
}