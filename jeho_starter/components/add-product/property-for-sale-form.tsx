"use client";

import Image from "next/image";
import { toast } from "sonner";
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
import { CATEGORIES, CONDITIONS, MEETUP_PREFERENCES, AVAILABILITY, productSchema, type ProductFormData } from "@/components/reuseables/items-stats";


export default function PropertyForSalePage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addProduct] = useAddProductMutation();
  const { currency } = useCurrency();
  const currencySymbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€" };
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      price: 0,
      category: "",
      productCondition: "",
      brand: "",
      availability: "",
      productLimit: 1,
      location: "",
      description: "",
      meetupPreference: "",
      productImages: [],
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (!data.productImages || data.productImages.length === 0) {
        toast.error("Please upload at least one image.");
        return;
      }

      const uploadPromises = data.productImages.map((file) => file instanceof File ? uploadToCloudinary(file) : Promise.resolve(file));
      const imageUrls = await Promise.all(uploadPromises);
      const finalPayload = {
        ...data,
        title: data.title.trim(),
        price: Number(data.price),
        productLimit: Number(data.productLimit),
        location: data.location?.trim(),
        productImages: imageUrls,
        meetupPreference: data.meetupPreference.toUpperCase().replace(/\s+/g, '_'),
        category: data.category.toUpperCase(),
      };

      await addProduct(finalPayload).unwrap();
      
      toast.success("Property listed successfully!");
      form.reset();
    } catch (error: any) {
      console.error("Submission Error:", error);
      const backendMessage = error?.data?.message || "Failed to list property.";
      toast.error(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">List Property For Sale</h2>
            <Button variant="outline" onClick={() => form.reset()} type="button">
            Clear Form
          </Button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="space-y-6">
                <FormField control={form.control} name="productImages"
                  render={({ field }) => (
                    <ProductImageUploader value={field.value} onChange={field.onChange} error={form.formState.errors.productImages?.message as string} />
                  )}
                />

                <Card className="p-6 flex items-center gap-4 border-gray-200">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    <Image src={user?.picture || "/images/photo3.png"} alt={`${user?.firstName || 'User'}'s profile`} fill className="object-cover" />
                  </div>
                  <div className="text-center text-lg">
                  <h4 className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h4>
                  <p className="text-xs text-muted-foreground text-center">Verified Seller</p>
                </div>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 md:p-8 border-gray-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Property Title</FormLabel>
                          <FormControl><Input placeholder="e.g. 3 Bedroom Apartment" {...field} /></FormControl>
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
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {CATEGORIES.map((c) => ( <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem> ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="productCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Condition</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {CONDITIONS.map((c) => ( <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem> ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-[120px]" placeholder="Provide details..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-800 hover:bg-teal-900 text-white h-12 text-lg" >
                    {isSubmitting ? ( <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing... </> ) : ( "Publish Property" )}
                  </Button>
                </Card>
              </div>
            </form>
          </Form>
        </div>
      </div>
  );
}