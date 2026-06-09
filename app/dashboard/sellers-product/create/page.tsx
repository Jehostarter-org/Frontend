'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useCreateShopMutation } from "@/lib/api/productsApiSlice";
import { useState, useRef } from "react";
import {
  Store, ArrowLeft, ArrowRight, Check,
  Globe, Phone, MapPin, FileText, ImagePlus, Loader2,
} from "lucide-react";

interface FormState {
  name: string;
  description: string;
  city: string;
  whatsapp: string;
  website: string;
  logo: File | null;
}

const STEPS = ["Shop Info", "Contact", "Logo"] as const;

export default function CreateShopPage() {
  const router = useRouter();
  const [createShop, { isLoading }] = useCreateShopMutation();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    name: "", description: "", city: "",
    whatsapp: "", website: "", logo: null,
  });

  const set = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const canAdvance = () => {
    if (step === 0) return form.name.trim().length >= 2;
    if (step === 1) return true; // contact optional
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const body = new FormData();
      body.append("name", form.name.trim());
      body.append("description", form.description.trim());
      body.append("city", form.city.trim());
      if (form.whatsapp) body.append("whatsapp", form.whatsapp.trim());
      if (form.website) body.append("website", form.website.trim());
      if (form.logo) body.append("logo", form.logo);

      await createShop(body).unwrap();
      router.push("/dashboard/sellers-product");
    } catch (err: any) {
      const msg =
        err?.data?.name?.[0] ||
        err?.data?.detail ||
        err?.data?.non_field_errors?.[0] ||
        "Something went wrong. Please try again.";
      setError(msg);
    }
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* Back */}
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 text-xs font-black uppercase tracking-widest mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> {step > 0 ? "Back" : "Cancel"}
          </button>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-600 to-emerald-500" />

            <div className="p-8 md:p-10">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-8">
                {STEPS.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      i < step ? "bg-teal-600 text-white" :
                      i === step ? "bg-teal-600 text-white ring-4 ring-teal-100" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {i < step ? <Check size={12} /> : i + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      i === step ? "text-teal-600" : "text-gray-300"
                    }`}>{label}</span>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px w-8 ${i < step ? "bg-teal-300" : "bg-gray-100"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 0 — Shop info */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-teal-600 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                      <Store size={12} /> Shop Details
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Name your shop</h2>
                    <p className="text-gray-400 text-sm">This is how buyers will find you.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Shop Name *</label>
                      <Input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="e.g. Lagos Auto Parts"
                        className="rounded-xl border-gray-200 font-medium py-5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                        Description <span className="text-gray-300 normal-case font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Tell buyers what you sell..."
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <MapPin size={11} /> City
                      </label>
                      <Input
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                        placeholder="e.g. Lagos"
                        className="rounded-xl border-gray-200 font-medium py-5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 — Contact */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-teal-600 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                      <Phone size={12} /> Contact Details
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">How to reach you</h2>
                    <p className="text-gray-400 text-sm">Buyers will use this to contact you directly.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <Phone size={11} /> WhatsApp Number
                      </label>
                      <Input
                        value={form.whatsapp}
                        onChange={(e) => set("whatsapp", e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="rounded-xl border-gray-200 font-medium py-5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                        <Globe size={11} /> Website
                      </label>
                      <Input
                        value={form.website}
                        onChange={(e) => set("website", e.target.value)}
                        placeholder="https://yourshop.com"
                        className="rounded-xl border-gray-200 font-medium py-5 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Logo */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-teal-600 text-[10px] font-black uppercase tracking-[0.3em] mb-3">
                      <ImagePlus size={12} /> Shop Logo
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Add a logo</h2>
                    <p className="text-gray-400 text-sm">Optional — you can always add one later.</p>
                  </div>

                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-teal-50/30 group"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-24 h-24 rounded-2xl object-cover shadow-md" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center transition-colors">
                        <ImagePlus className="w-8 h-8 text-gray-300 group-hover:text-teal-500 transition-colors" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-black text-gray-700 uppercase tracking-wide">
                        {logoPreview ? "Change logo" : "Upload logo"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                {step < STEPS.length - 1 ? (
                  <Button
                    onClick={() => setStep(s => s + 1)}
                    disabled={!canAdvance()}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Continue <ArrowRight size={14} />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl font-black uppercase tracking-widest text-xs py-6 shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 size={14} className="animate-spin" /> Creating shop...</>
                    ) : (
                      <><Check size={14} /> Launch Shop</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}