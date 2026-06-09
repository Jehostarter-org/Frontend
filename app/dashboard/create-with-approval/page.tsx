"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Building2, FileText, Upload, CheckCircle2, Clock,
    XCircle, AlertCircle, ChevronRight, Trash2, Loader2,
    ArrowLeft, Store, BadgeCheck
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { useCreateShopWithApprovalMutation, useGetMyShopApprovalStatusQuery } from "@/lib/api/shopApprovalApiSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ── Zod schema ────────────────────────────────────────────────────────────────
const shopSchema = z.object({
    // Shop fields
    name: z.string().min(3, "Shop name must be at least 3 characters"),
    description: z.string().min(20, "Please write a brief description (20+ chars)"),
    city: z.string().min(2, "City is required"),
    state_province: z.string().optional(),
    whatsapp: z.string().optional(),
    website: z.string().url("Enter a valid URL").optional().or(z.literal("")),

    // Approval / business fields
    business_name: z.string().min(3, "Business name is required"),
    registration_number: z.string().optional(),
    tax_number: z.string().optional(),
    business_address: z.string().min(5, "Business address is required"),
    business_phone: z.string().min(5, "Business phone is required"),
    business_email: z.string().email("Enter a valid email"),
    business_description: z.string().optional(),
    years_in_business: z.coerce.number().min(0).default(0),
    employee_count: z.coerce.number().min(1).default(1),
});

type ShopFormValues = z.input<typeof shopSchema>;
type ShopFormOutput = z.output<typeof shopSchema>;

// ── Document type options ─────────────────────────────────────────────────────
const DOCUMENT_TYPES = [
    { value: "business_registration", label: "Business Registration Certificate" },
    { value: "tax_id", label: "Tax Identification Number" },
    { value: "id_proof", label: "Government ID Proof" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "trade_license", label: "Trade License" },
    { value: "vat_certificate", label: "VAT Certificate" },
];

interface UploadedDoc {
    file: File;
    type: string;
    preview: string;
}

const STEPS = ["Shop Info", "Business Details", "Documents", "Review"];

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
        pending: { icon: <Clock className="w-4 h-4" />, color: "text-amber-600 bg-amber-50 border-amber-200", label: "Pending Review" },
        in_review: { icon: <AlertCircle className="w-4 h-4" />, color: "text-blue-600 bg-blue-50 border-blue-200", label: "Under Review" },
        approved: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-50 border-emerald-200", label: "Approved" },
        rejected: { icon: <XCircle className="w-4 h-4" />, color: "text-red-600 bg-red-50 border-red-200", label: "Rejected" },
        changes_requested: { icon: <AlertCircle className="w-4 h-4" />, color: "text-orange-600 bg-orange-50 border-orange-200", label: "Changes Requested" },
        draft: { icon: <FileText className="w-4 h-4" />, color: "text-gray-600 bg-gray-50 border-gray-200", label: "Draft" },
    };
    const cfg = map[status] ?? map["draft"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

// ── Approval Status Screen ────────────────────────────────────────────────────
function ApprovalStatusScreen({ shopData }: { shopData: any }) {
    const router = useRouter();
    const approvalStatus = shopData?.approval_request?.status ?? "pending";
    const isApproved = approvalStatus === "approved";
    const changesRequested = approvalStatus === "changes_requested";
    const docsStatus = shopData?.documents_status ?? {};

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${isApproved ? "bg-emerald-100" : "bg-teal-100"
                    }`}>
                    {isApproved
                        ? <BadgeCheck className="w-8 h-8 text-emerald-600" />
                        : <Clock className="w-8 h-8 text-teal-700" />
                    }
                </div>
                <h1 className="text-2xl font-black text-gray-900">{shopData.name}</h1>
                <p className="text-gray-500 text-sm mt-1">Shop Application Status</p>
                <div className="mt-3">
                    <StatusBadge status={approvalStatus} />
                </div>
            </div>

            {/* Status messages */}
            {approvalStatus === "pending" && (
                <Card className="p-5 border-amber-200 bg-amber-50 mb-6">
                    <p className="text-amber-800 font-semibold text-sm">⏳ Your application is queued for review.</p>
                    <p className="text-amber-700 text-sm mt-1">
                        Our team usually reviews applications within 1–2 business days. You'll be notified when the status changes.
                    </p>
                </Card>
            )}
            {approvalStatus === "in_review" && (
                <Card className="p-5 border-blue-200 bg-blue-50 mb-6">
                    <p className="text-blue-800 font-semibold text-sm">🔍 An admin is currently reviewing your application.</p>
                    <p className="text-blue-700 text-sm mt-1">This usually takes a few hours. Hang tight!</p>
                </Card>
            )}
            {approvalStatus === "approved" && (
                <Card className="p-5 border-emerald-200 bg-emerald-50 mb-6">
                    <p className="text-emerald-800 font-semibold text-sm">🎉 Congratulations! Your shop is live.</p>
                    <p className="text-emerald-700 text-sm mt-1">
                        You can now start adding listings and selling on Jehostarter.
                    </p>
                    <Button
                        className="mt-4 bg-teal-700 hover:bg-teal-800 text-white"
                        onClick={() => router.push("/dashboard/shop/listings/new")}
                    >
                        Add Your First Listing →
                    </Button>
                </Card>
            )}
            {approvalStatus === "rejected" && (
                <Card className="p-5 border-red-200 bg-red-50 mb-6">
                    <p className="text-red-800 font-semibold text-sm">❌ Application Rejected</p>
                    <p className="text-red-700 text-sm mt-1">
                        {shopData?.approval_request?.admin_notes || "Your application did not meet our requirements."}
                    </p>
                    <p className="text-red-600 text-xs mt-2">Contact support if you believe this is an error.</p>
                </Card>
            )}
            {changesRequested && (
                <Card className="p-5 border-orange-200 bg-orange-50 mb-6">
                    <p className="text-orange-800 font-semibold text-sm">📝 Changes Required</p>
                    <p className="text-orange-700 text-sm mt-2">
                        {shopData?.approval_request?.changes_requested_notes}
                    </p>
                    <Button
                        className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => router.push("/dashboard/shop/resubmit")}
                    >
                        Update &amp; Resubmit
                    </Button>
                </Card>
            )}

            {/* Documents summary */}
            {docsStatus.total > 0 && (
                <Card className="p-5 border-gray-200 mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3">📎 Documents ({docsStatus.total})</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                            { label: "Pending", count: docsStatus.pending, color: "text-amber-600" },
                            { label: "Approved", count: docsStatus.approved, color: "text-emerald-600" },
                            { label: "Rejected", count: docsStatus.rejected, color: "text-red-600" },
                        ].map((d) => (
                            <div key={d.label} className="bg-gray-50 rounded-xl p-3">
                                <p className={`text-2xl font-black ${d.color}`}>{d.count}</p>
                                <p className="text-xs text-gray-500 mt-1">{d.label}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ShopCreateWithApproval() {
    const router = useRouter();
    const user = useSelector(selectCurrentUser);
    const [step, setStep] = useState(0);
    const [docs, setDocs] = useState<UploadedDoc[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: approvalData, isLoading: statusLoading } = useGetMyShopApprovalStatusQuery(undefined);
    const [createShop] = useCreateShopWithApprovalMutation();

    const form = useForm<ShopFormValues>({
        resolver: zodResolver(shopSchema),
        defaultValues: {
            name: "", description: "", city: "", state_province: "",
            whatsapp: "", website: "",
            business_name: user?.first_name ? `${user.first_name}'s Business` : "",
            registration_number: "", tax_number: "",
            business_address: "", business_phone: user?.phone_number ?? "",
            business_email: user?.email ?? "",
            business_description: "",
            years_in_business: 0, employee_count: 1,
        },
    });

    // ── If shop already exists, show status screen ────────────────────────────
    if (!statusLoading && approvalData?.has_shop) {
        return <ApprovalStatusScreen shopData={approvalData.shop} />;
    }

    // ── Document upload helpers ───────────────────────────────────────────────
    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        const files = Array.from(e.target.files ?? []);
        const newDocs = files.map((file) => ({
            file,
            type,
            preview: file.name,
        }));
        setDocs((prev) => [...prev, ...newDocs]);
        e.target.value = "";
    };

    const removeDoc = (idx: number) => setDocs((prev) => prev.filter((_, i) => i !== idx));

    // ── Step navigation ───────────────────────────────────────────────────────
    const goNext = async () => {
        const fieldsPerStep: (keyof ShopFormValues)[][] = [
            ["name", "description", "city"],
            ["business_name", "business_address", "business_phone", "business_email"],
            [],
        ];
        const fields = fieldsPerStep[step];
        if (fields?.length) {
            const valid = await form.trigger(fields);
            if (!valid) return;
        }
        if (step === 2 && docs.length < 2) {
            toast.error("Please upload at least 2 documents for verification.");
            return;
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };
    const goPrev = () => setStep((s) => Math.max(s - 1, 0));

    // ── Final submit ──────────────────────────────────────────────────────────
    const onSubmit = async (data: ShopFormValues) => {
        if (docs.length < 2) {
            toast.error("Please upload at least 2 verification documents.");
            setStep(2);
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Shop fields
            (["name", "description", "city", "state_province", "whatsapp", "website"] as const).forEach((k) => {
                if (data[k]) formData.append(k, String(data[k]));
            });

            // Approval / business fields (nested)
            const approvalFields = {
                business_name: data.business_name,
                registration_number: data.registration_number ?? "",
                tax_number: data.tax_number ?? "",
                business_address: data.business_address,
                business_phone: data.business_phone,
                business_email: data.business_email,
                business_description: data.business_description ?? "",
                years_in_business: String(data.years_in_business),
                employee_count: String(data.employee_count),
            };
            Object.entries(approvalFields).forEach(([k, v]) => {
                formData.append(`approval_request.${k}`, v);
            });

            // Documents
            docs.forEach((d) => formData.append("documents", d.file));

            await createShop(formData).unwrap();
            toast.success("Shop application submitted! We'll review it shortly.");
            router.refresh();
        } catch (err: any) {
            const msg = err?.data?.detail ?? err?.data?.message ?? "Submission failed. Please try again.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h1 className="text-3xl font-black text-gray-900">Create Your Shop</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Fill in your details and upload documents — our team will review within 1–2 business days.
                    </p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-0 mb-8">
                    {STEPS.map((label, i) => (
                        <div key={label} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i < step
                                        ? "bg-teal-700 border-teal-700 text-white"
                                        : i === step
                                            ? "bg-white border-teal-700 text-teal-700"
                                            : "bg-white border-gray-300 text-gray-400"
                                    }`}>
                                    {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={`text-xs mt-1 font-semibold hidden sm:block ${i === step ? "text-teal-700" : i < step ? "text-gray-700" : "text-gray-400"
                                    }`}>{label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 transition-all ${i < step ? "bg-teal-700" : "bg-gray-200"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card className="p-6 md:p-8 border-gray-200 space-y-6">

                            {/* ── Step 0: Shop Info ── */}
                            {step === 0 && (
                                <>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                                            <Store className="w-5 h-5 text-teal-700" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-900">Shop Information</h2>
                                            <p className="text-xs text-gray-500">What customers will see on your shop page</p>
                                        </div>
                                    </div>

                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shop Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Lagos Essentials" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shop Description *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Tell customers what you sell and what makes your shop special..."
                                                    className="min-h-[100px] resize-y" {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City *</FormLabel>
                                                <FormControl><Input placeholder="e.g. Brisbane" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="state_province" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State / Province</FormLabel>
                                                <FormControl><Input placeholder="e.g. Queensland" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="whatsapp" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>WhatsApp Number</FormLabel>
                                                <FormControl><Input placeholder="+234 800 0000 000" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="website" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website (optional)</FormLabel>
                                                <FormControl><Input placeholder="https://myshop.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </>
                            )}

                            {/* ── Step 1: Business Details ── */}
                            {step === 1 && (
                                <>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-teal-700" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-900">Business Details</h2>
                                            <p className="text-xs text-gray-500">Used for verification — not shown publicly</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="business_name" render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Registered Business Name *</FormLabel>
                                                <FormControl><Input placeholder="Legal business name" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="registration_number" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Registration Number</FormLabel>
                                                <FormControl><Input placeholder="RC-12345" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="tax_number" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tax / TIN Number</FormLabel>
                                                <FormControl><Input placeholder="TIN-000000" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="business_address" render={({ field }) => (
                                            <FormItem className="sm:col-span-2">
                                                <FormLabel>Business Address *</FormLabel>
                                                <FormControl><Input placeholder="123 Market Street, City" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="business_phone" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Phone *</FormLabel>
                                                <FormControl><Input placeholder="+234 800 000 0000" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="business_email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Email *</FormLabel>
                                                <FormControl><Input type="email" placeholder="shop@example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="years_in_business" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Years in Business</FormLabel>
                                                <FormControl><Input type="number" min={0} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="employee_count" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Employees</FormLabel>
                                                <FormControl><Input type="number" min={1} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </>
                            )}

                            {/* ── Step 2: Documents ── */}
                            {step === 2 && (
                                <>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-teal-700" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-900">Verification Documents</h2>
                                            <p className="text-xs text-gray-500">Upload at least 2 documents (PDF, JPG, PNG)</p>
                                        </div>
                                    </div>

                                    {/* Upload zones per type */}
                                    <div className="space-y-3">
                                        {DOCUMENT_TYPES.map((dt) => {
                                            const existing = docs.filter((d) => d.type === dt.value);
                                            return (
                                                <div key={dt.value} className="border border-dashed border-gray-300 rounded-xl p-4 hover:border-teal-400 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-700">{dt.label}</p>
                                                            {existing.length > 0 && (
                                                                <p className="text-xs text-teal-600 mt-0.5">{existing.length} file(s) uploaded</p>
                                                            )}
                                                        </div>
                                                        <label className="cursor-pointer">
                                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold transition-colors">
                                                                <Upload className="w-3.5 h-3.5" /> Upload
                                                            </div>
                                                            <input
                                                                type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                                                                className="hidden"
                                                                onChange={(e) => handleDocUpload(e, dt.value)}
                                                            />
                                                        </label>
                                                    </div>
                                                    {existing.map((d, i) => {
                                                        const globalIdx = docs.indexOf(d);
                                                        return (
                                                            <div key={i} className="flex items-center justify-between mt-2 bg-gray-50 rounded-lg px-3 py-2">
                                                                <span className="text-xs text-gray-600 truncate max-w-[240px]">{d.file.name}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeDoc(globalIdx)}
                                                                    className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {docs.length < 2 && (
                                        <p className="text-xs text-amber-600 font-medium">
                                            ⚠ Please upload at least 2 documents before continuing.
                                        </p>
                                    )}
                                </>
                            )}

                            {/* ── Step 3: Review ── */}
                            {step === 3 && (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-teal-700" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-900">Review &amp; Submit</h2>
                                            <p className="text-xs text-gray-500">Double-check before sending to our team</p>
                                        </div>
                                    </div>

                                    {/* Summary rows */}
                                    {[
                                        { label: "Shop Name", value: form.getValues("name") },
                                        { label: "City", value: form.getValues("city") },
                                        { label: "Business Name", value: form.getValues("business_name") },
                                        { label: "Business Email", value: form.getValues("business_email") },
                                        { label: "Business Phone", value: form.getValues("business_phone") },
                                        { label: "Documents", value: `${docs.length} file(s) ready` },
                                    ].map((row) => (
                                        <div key={row.label} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
                                            <span className="text-sm text-gray-500">{row.label}</span>
                                            <span className="text-sm font-semibold text-gray-800">{row.value || "—"}</span>
                                        </div>
                                    ))}

                                    <div className="bg-teal-50 rounded-xl p-4 mt-2">
                                        <p className="text-xs text-teal-800 font-semibold">What happens next?</p>
                                        <ol className="text-xs text-teal-700 mt-1 space-y-1 list-decimal list-inside">
                                            <li>Our team reviews your application (1–2 business days)</li>
                                            <li>You'll receive a notification when it's approved or if changes are needed</li>
                                            <li>Once approved, your shop goes live and you can add listings</li>
                                        </ol>
                                    </div>
                                </>
                            )}
                        </Card>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-6">
                            <Button
                                type="button" variant="outline"
                                onClick={goPrev} disabled={step === 0}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back
                            </Button>

                            {step < STEPS.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={goNext}
                                    className="bg-teal-700 hover:bg-teal-800 text-white gap-2"
                                >
                                    Next <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-teal-700 hover:bg-teal-800 text-white gap-2 min-w-[160px]"
                                >
                                    {isSubmitting
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                                        : <><CheckCircle2 className="w-4 h-4" /> Submit Application</>
                                    }
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>

            </div>
        </div>
    );
}