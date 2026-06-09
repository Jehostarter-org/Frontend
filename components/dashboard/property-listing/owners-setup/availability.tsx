"use client";

import { useForm } from "react-hook-form";
import { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Calendar, DollarSign, Clock, ShieldCheck } from "lucide-react";

import FormSection from "../../form-section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { HOUSE_RULES_LIST } from "@/lib/property-constant";
import { ownerStep3Schema, OwnerStep3Values } from "@/components/types/schemas/property-scehma";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface OwnerStep3Props {
  onNext: (data: OwnerStep3Values) => void;
  onBack: () => void;
  initialData: Partial<OwnerStep3Values>;
}

export default function AvailabilityStep({ onNext, onBack, initialData }: OwnerStep3Props) {
  
  const form = useForm<OwnerStep3Values>({
    resolver: zodResolver(ownerStep3Schema),
    defaultValues: {
      availableFrom: initialData.availableFrom || "",
      priceAmount: initialData.priceAmount || "",
      priceType: initialData.priceType || "monthly",
      securityDeposit: initialData.securityDeposit || false,
      minStayDuration: initialData.minStayDuration || "1",
      maxStayDuration: initialData.maxStayDuration || "",
      houseRules: initialData.houseRules || [],
    },
  });

  const onSubmit = (data: OwnerStep3Values) => {
    // Final check: Ensure max duration >= min duration if both are provided as numbers
    const min = parseInt(data.minStayDuration || "");
    const max = parseInt(data.maxStayDuration || "");
    
    if (max && min && max < min) {
      form.setError("maxStayDuration", { message: "Maximum stay cannot be less than minimum stay." });
      return;
    }
    
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Header */}
          <div className="bg-gray-300 p-6 border-b border-gray-100 flex items-center gap-4">
            <Button type="button" variant="ghost" onClick={onBack} className="h-10 w-10 p-0 rounded-full hover:bg-white hover:shadow-sm">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Availability & Pricing</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Step 3: Financials & Rules</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-10">
            {/* --- Pricing Section --- */}
            <FormSection title="Pricing Model" description="Set your rates and preferred payment frequency.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <FormField control={form.control} name="priceAmount" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-semibold">Listing Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="pl-8 h-12 text-lg font-medium focus:ring-teal-500" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="priceType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Billing Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </FormSection>

            {/* --- Availability & Terms --- */}
            <FormSection title="Terms of Stay" description="Define when the property is free and for how long.">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="availableFrom" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Calendar className="h-4 w-4 text-teal-600" /> Available From
                    </FormLabel>
                    <FormControl>
                      <Input type="date" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="minStayDuration" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Clock className="h-4 w-4 text-teal-600" /> Min Stay (Days)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="maxStayDuration" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      <Clock className="h-4 w-4 text-teal-600" /> Max Stay (Days)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Optional" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="mt-6">
                <FormField control={form.control} name="securityDeposit" render={({ field }) => (
                  <FormItem className={cn(
                    "flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-5 transition-all",
                    field.value ? "border-teal-600 bg-teal-50/30" : "bg-gray-50/50"
                  )}>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="font-bold text-gray-900 cursor-pointer flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-teal-600" /> Require Security Deposit
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Ticking this requires tenants to pay a refundable fee for damage protection.
                      </FormDescription>
                    </div>
                  </FormItem>
                )} />
              </div>
            </FormSection>

            {/* --- Rules --- */}
            <FormSection title="House Rules" description="Select standard guidelines for your tenants.">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {HOUSE_RULES_LIST.map((rule) => (
                  <FormField key={rule.id} control={form.control} name="houseRules" render={({ field }) => {
                    const isChecked = field.value?.includes(rule.id);
                    return (
                      <FormItem className={cn(
                        "flex flex-row items-center space-x-3 space-y-0 rounded-xl border p-4 transition-all hover:shadow-sm cursor-pointer",
                        isChecked ? "border-teal-600 bg-teal-50/40" : "border-gray-200"
                      )}>
                        <FormControl>
                          <Checkbox 
                            checked={isChecked} 
                            onCheckedChange={(checked) => {
                              return checked 
                                ? field.onChange([...(field.value || []), rule.id]) 
                                : field.onChange(field.value?.filter((v) => v !== rule.id));
                            }} 
                          />
                        </FormControl>
                        <FormLabel className="font-medium cursor-pointer flex-1 text-sm text-gray-700">
                          {rule.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }} />
                ))}
              </div>
            </FormSection>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
          <Button type="button" variant="outline" onClick={onBack} className="text-black border-teal-500 px-10 h-11 hover:bg-white">
            Back
          </Button>
          <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-5 h-11 font-bold shadow-lg transition-all active:scale-95">
            Review Listing
          </Button>
        </div>
      </form>
    </Form>
  );
}