"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCurrency } from "../contexts/currencyContext";
import {
  useGetSingleProductQuery,
  useUpdateListingMutation,
  useGetCategoriesQuery,
} from "@/lib/api/productsApiSlice";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const editItemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  listing_type: z.enum(["sale", "rent", "service"]),
  condition: z.enum(["new", "used", "refurbished"]).optional(),
  category: z.string().min(1, "Please select a category"),
});

type EditItemFormValues = z.input<typeof editItemSchema>;
type EditItemFormData = z.output<typeof editItemSchema>;

const LISTING_TYPES = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "service", label: "Service" },
];
const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

export function EditProductDialog({
  productId,
  onClose,
}: {
  productId: string | null;
  onClose: () => void;
}) {
  const { data: product, isLoading: productLoading } = useGetSingleProductQuery(productId ?? "", {
    skip: !productId,
  });
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);
  const [updateListing, { isLoading: isUpdating }] = useUpdateListingMutation();
  const { currency } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayCurrency = currency || product?.currency || "NGN";
  const currencySymbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€", GHS: "₵", KES: "KSh", ZAR: "R", INR: "₹", NPR: "Rs", CNY: "¥", CAD: "C$", AUD: "A$" };

  const form = useForm<EditItemFormValues, unknown, EditItemFormData>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      listing_type: "sale",
      condition: undefined,
      category: "",
    },
  });

  useEffect(() => {
    if (!product) return;
    form.reset({
      title: product.title,
      description: product.description,
      price: Number(product.price ?? 0) || 0,
      listing_type: (product.listing_type as "sale" | "rent" | "service") || "sale",
      condition: (product.condition as "new" | "used" | "refurbished" | undefined) || undefined,
      category: product.category,
    });
  }, [product, form]);

  const onSubmit = async (data: EditItemFormData) => {
    if (!productId) return;
    setIsSubmitting(true);
    try {
      await updateListing({
        id: productId,
        title: data.title,
        description: data.description,
        price: data.price,
        listing_type: data.listing_type,
        condition: data.condition,
        category: data.category,
      }).unwrap();
      toast.success("Item updated successfully");
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: unknown };
      const errData = err?.data;
      let msg = "Failed to update item.";
      if (typeof errData === "string") {
        msg = errData;
      } else if (errData && typeof errData === "object" && "detail" in errData) {
        msg = String((errData as { detail: unknown }).detail);
      } else if (errData && typeof errData === "object") {
        const first = Object.entries(errData as Record<string, unknown>)[0];
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

  const loading = productLoading || !product;

  return (
    <Dialog open={!!productId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Update the details of this product.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
              Loading item...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {product.images.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> Current Images
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <Image src={img.image} alt={product.title} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Item Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. iPhone 14 Pro — 256GB, excellent condition" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ({displayCurrency})</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold transition-colors group-focus-within:text-teal-600">
                              {currencySymbols[displayCurrency] || ""}
                            </div>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="pl-9 h-11 border-gray-200 focus-visible:ring-teal-500/20 focus-visible:border-teal-500 transition-all font-semibold"
                              value={String(field.value ?? '')}
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="listing_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LISTING_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={categoriesLoading ? "Loading..." : "Select category"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(categories || []).length === 0 ? (
                              <SelectItem value="__none__" disabled>
                                No categories — contact support
                              </SelectItem>
                            ) : (
                              (categories || []).map((c: { id: string; name: string }) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONDITIONS.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
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
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px] resize-y"
                          placeholder="Brand, size, colour, defects, reason for selling..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="h-11 rounded-xl font-bold text-sm border-gray-200 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUpdating}
                    className="h-11 rounded-xl font-bold text-sm bg-teal-800 hover:bg-teal-900 text-white"
                  >
                    {isSubmitting || isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
