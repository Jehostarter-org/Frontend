"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCurrency } from "../contexts/currencyContext";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import {
  useCreateListingMutation,
  useGetMyShopQuery,
  useGetCategoriesQuery,
} from "@/lib/api/productsApiSlice";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ProductImageUploader } from "@/components/reuseables/product-image-uploader";
import { getSubcategories } from "@/components/reuseables/items-stats";

// ── Schema ────────────────────────────────────────────────────────────────────
const vehicleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  listing_type: z.enum(["sale", "rent", "service"]),
  condition: z.enum(["new", "used", "refurbished"]).optional(),
  category: z.string().min(1, "Please select a category"),
  subcategory: z.string().optional(),
  productImages: z.array(z.instanceof(File)).min(1, "Please upload at least one image").max(5, "Max 5 images"),
});

type VehicleFormValues = z.input<typeof vehicleSchema>;
type VehicleFormData = z.output<typeof vehicleSchema>;

const LISTING_TYPES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];
const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function VehicleForSalePage() {
  const user = useSelector(selectCurrentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: myShop } = useGetMyShopQuery(undefined);
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);
  const [createListing] = useCreateListingMutation();
  const { currency } = useCurrency();

  const displayCurrency = currency || myShop?.currency || "NGN";
  const displayShopName = myShop?.name || "Your Listings";
  const currencySymbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€", GHS: "₵", KES: "KSh", ZAR: "R", INR: "₹", NPR: "Rs", CNY: "¥", CAD: "C$", AUD: "A$" };

  const form = useForm<VehicleFormValues, any, VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      title: "", description: "", price: 0,
      listing_type: "sale", condition: undefined, category: "", subcategory: "", productImages: [],
    },
  });

  const selectedCategorySlug = categories?.find((c) => c.id === form.watch("category"))?.slug;
  const subcategories = getSubcategories(selectedCategorySlug);

  useEffect(() => {
    if (!categories?.length || form.getValues("category")) return;
    const preferred = categories.find((c) => c.slug === "vehicles");
    if (preferred) form.setValue("category", preferred.id);
  }, [categories, form]);

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("listing_type", data.listing_type);
      formData.append("category", data.category);
      if (data.subcategory) formData.append("subcategory", data.subcategory);
      if (data.condition) formData.append("condition", data.condition);
      formData.append("is_available", "true");
      data.productImages.forEach((file) => formData.append("images", file));

      await createListing(formData).unwrap();
      toast.success("Vehicle listed successfully!");
      form.reset();
    } catch (error: any) {
      const errData = error?.data;
      let msg = "Failed to list vehicle.";
      if (typeof errData === "string") {
        msg = errData;
      } else if (errData?.detail) {
        msg = errData.detail;
      } else if (errData && typeof errData === "object") {
        const first = Object.entries(errData)[0];
        if (first) {
          const [field, value] = first;
          msg = `${field}: ${Array.isArray(value) ? value.join(", ") : String(value)}`;
        }
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">List Vehicle</h2>
            <p className="text-sm text-teal-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {displayShopName}
            </p>
          </div>
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
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={user.first_name || "Seller"} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-700 text-2xl font-black">
                      {user?.first_name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{user?.first_name} {user?.last_name}</h4>
                  <p className="text-xs text-gray-500">{displayShopName}</p>
                  <p className="text-xs text-teal-600 font-semibold mt-0.5">{user?.membership_plan || "Free"} Member</p>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 md:p-8 border-gray-200 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Vehicle Name</FormLabel>
                      <FormControl><Input placeholder="e.g. 2022 Toyota Camry — excellent condition" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex justify-between items-end">
                        <span>Price ({displayCurrency})</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold transition-colors group-focus-within:text-teal-600">
                            {currencySymbols[displayCurrency] || ""}
                          </div>
                          <Input type="number" placeholder="0.00" className="pl-9 h-11 border-gray-200 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all font-semibold"
                            value={String(field.value ?? '')} onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="listing_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LISTING_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={(v) => { field.onChange(v); form.setValue("subcategory", ""); }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(categories || []).length === 0 ? (
                            <SelectItem value="__none__" disabled>
                              No categories — contact support
                            </SelectItem>
                          ) : (
                            (categories || []).map((c: { id: string; name: string; slug: string }) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {subcategories.length > 0 && (
                    <FormField control={form.control} name="subcategory" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subcategories.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  <FormField control={form.control} name="condition" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CONDITIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[150px] resize-y" placeholder="Engine specs, mileage, year, transmission, reason for selling..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={isSubmitting} className="w-full bg-teal-800 hover:bg-teal-900 text-white h-12 text-base font-bold">
                  {isSubmitting ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>) : ("Publish Vehicle")}
                </Button>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}