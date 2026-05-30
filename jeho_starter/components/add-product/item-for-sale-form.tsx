"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import {
  useCreateListingMutation,
  useGetMyShopQuery,
  useGetCategoriesQuery,
} from "@/lib/api/productsApiSlice";
import { useGetMyShopApprovalStatusQuery } from "@/lib/api/shopApprovalApiSlice";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ── Schema ────────────────────────────────────────────────────────────────────
const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  listing_type: z.enum(["sale", "rent", "service"]),
  condition: z.enum(["new", "used", "refurbished"]).optional(),
  category: z.string().min(1, "Please select a category"),
  images: z.array(z.instanceof(File)).min(1, "Please upload at least one image"),
});

type ListingFormValues = z.input<typeof listingSchema>;
type ListingFormData = z.output<typeof listingSchema>;

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

// ── Approval Gate Screen ──────────────────────────────────────────────────────
function ApprovalGate({ status, notes }: { status: string; notes?: string }) {
  const cfg: Record<string, { icon: React.ReactNode; heading: string; body: string; color: string; bg: string }> = {
    pending: {
      icon: <Clock className="w-10 h-10 text-amber-500" />,
      heading: "Waiting for Approval",
      body: "Your shop application is being reviewed by our team. You'll be able to add listings once it's approved (usually 1–2 business days).",
      color: "text-amber-700", bg: "bg-amber-50 border-amber-200",
    },
    in_review: {
      icon: <AlertCircle className="w-10 h-10 text-blue-500" />,
      heading: "Application Under Review",
      body: "An admin is currently reviewing your shop. Hang tight — you'll be notified shortly.",
      color: "text-blue-700", bg: "bg-blue-50 border-blue-200",
    },
    changes_requested: {
      icon: <AlertCircle className="w-10 h-10 text-orange-500" />,
      heading: "Changes Requested",
      body: notes ?? "Our team has requested changes to your shop application. Please update and resubmit.",
      color: "text-orange-700", bg: "bg-orange-50 border-orange-200",
    },
    rejected: {
      icon: <XCircle className="w-10 h-10 text-red-500" />,
      heading: "Application Rejected",
      body: notes ?? "Your shop application was not approved. Contact support if you believe this is an error.",
      color: "text-red-700", bg: "bg-red-50 border-red-200",
    },
    draft: {
      icon: <AlertCircle className="w-10 h-10 text-gray-400" />,
      heading: "Shop Not Submitted",
      body: "Your shop application hasn't been submitted yet. Complete and submit it to start selling.",
      color: "text-gray-600", bg: "bg-gray-50 border-gray-200",
    },
  };

  const c = cfg[status] ?? cfg["pending"];

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] px-6 text-center gap-4">
      {c.icon}
      <div>
        <h2 className="text-xl font-black text-gray-900">{c.heading}</h2>
        <p className="text-gray-500 text-sm max-w-sm mt-2">{c.body}</p>
      </div>
      <div className={`w-full max-w-sm rounded-xl border p-4 ${c.bg}`}>
        <p className={`text-sm font-semibold ${c.color}`}>
          Shop Status: <span className="capitalize">{status.replace("_", " ")}</span>
        </p>
      </div>
      {status === "changes_requested" && (
        <Button
          onClick={() => window.location.href = "/dashboard/shop/resubmit"}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          Update &amp; Resubmit →
        </Button>
      )}
      <Button variant="outline" onClick={() => window.location.href = "/dashboard/shop"}>
        View Shop Status
      </Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ItemForSaleForm() {
  const user = useSelector(selectCurrentUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: myShop, isLoading: shopLoading } = useGetMyShopQuery(undefined);
  const { data: approvalData, isLoading: approvalLoading } = useGetMyShopApprovalStatusQuery();
  const { data: categories, isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);
  const [createListing] = useCreateListingMutation();

  const form = useForm<ListingFormValues, any, ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "", description: "", price: 0,
      listing_type: "sale", condition: "new", category: "", images: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    form.setValue("images", files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const onSubmit = async (data: ListingFormData) => {
    if (!myShop) {
      toast.error("You need an approved shop before adding listings.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", String(data.price));
      formData.append("listing_type", data.listing_type);
      formData.append("category", data.category);
      if (data.condition) formData.append("condition", data.condition);
      formData.append("is_available", "true");
      data.images.forEach((file) => formData.append("images", file));

      await createListing(formData).unwrap();
      toast.success("Listing published successfully!");
      form.reset();
      setImagePreviews([]);
    } catch (error: any) {
      const data = error?.data;
      let msg = "Failed to publish listing.";
      if (typeof data === "string") {
        msg = data;
      } else if (data?.detail) {
        msg = data.detail;
      } else if (data && typeof data === "object") {
        const first = Object.entries(data)[0];
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

  const loading = shopLoading || approvalLoading;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
      </div>
    );
  }

  // ── No shop created at all ─────────────────────────────────────────────────
  if (!approvalData?.has_shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-10 text-center">
        <div className="text-5xl">🏪</div>
        <h2 className="text-2xl font-black text-gray-900">You don't have a shop yet</h2>
        <p className="text-gray-500 max-w-sm">
          Create your shop first — our team will review it, then you can start listing items.
        </p>
        <Button
          className="bg-teal-700 hover:bg-teal-800 text-white mt-2"
          onClick={() => window.location.href = "/dashboard/create-with-approval"}
        >
          Create My Shop
        </Button>
      </div>
    );
  }

  // ── Shop exists but not yet approved ──────────────────────────────────────
  const approvalStatus = approvalData?.shop?.approval_request?.status;
  const isApproved = approvalStatus === "approved" && myShop?.is_active;

  if (!isApproved) {
    return (
      <ApprovalGate
        status={approvalStatus ?? "pending"}
        notes={approvalData?.shop?.approval_request?.admin_notes}
      />
    );
  }

  // ── Approved — show the listing form ──────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Add a Listing</h2>
            {myShop && (
              <p className="text-sm text-teal-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {myShop.name} — Approved Shop
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => { form.reset(); setImagePreviews([]); }} type="button">
            Clear Form
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: image upload + seller card */}
            <div className="space-y-6">
              <Card className="p-4 border-gray-200">
                <p className="text-sm font-bold text-gray-700 mb-3">Product Images</p>
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-teal-200 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                    <p className="text-sm text-gray-500">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB each</p>
                  </div>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {form.formState.errors.images && (
                  <p className="text-xs text-red-500 mt-2">{form.formState.errors.images.message}</p>
                )}
              </Card>

              <Card className="p-4 flex items-center gap-4 border-gray-200">
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
                  <p className="text-xs text-gray-500">{myShop?.name || "Your Shop"}</p>
                  <p className="text-xs text-teal-600 font-semibold mt-0.5">{user?.membership_plan || "Free"} Member</p>
                </div>
              </Card>
            </div>

            {/* Right: form fields */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 md:p-8 border-gray-200 space-y-6">

                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MacBook Pro M3 — excellent condition" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ({myShop?.currency || "USD"})</FormLabel>
                      <FormControl>
                        <Input
                          type="number" placeholder="0.00"
                          value={field.value == null ? "" : String(field.value)}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="listing_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Listing Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                  <FormField control={form.control} name="condition" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your item — condition, size, age, reason for selling..."
                        className="min-h-[150px] resize-y" {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button
                  type="submit" disabled={isSubmitting || shopLoading}
                  className="w-full bg-teal-800 hover:bg-teal-900 text-white h-12 text-base font-bold"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...</>
                    : "Publish Listing"}
                </Button>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}