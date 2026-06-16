"use client";

import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Wallet, CheckSquare, Search, Home, Clock, MapPin } from "lucide-react";
import { AMENITIES_LIST, DURATION_TYPES, PROPERTY_TYPES } from "@/lib/property-constant";
import { tenantSearchSchema, TenantSearchData } from "@/components/types/schemas/tenants-scehma";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface TenantSearchFormProps {
  onSearch: (data: TenantSearchData) => void;
  isLoading?: boolean;
}

export function TenantSearchForm({ onSearch, isLoading }: TenantSearchFormProps) {
  const user = useSelector(selectCurrentUser);
  const form = useForm<TenantSearchData>({
    resolver: zodResolver(tenantSearchSchema),
    defaultValues: {
      city: user?.city || "",
      moveInDate: "",
      budget: 0,
      amenities: [],
      propertyType: "",
      duration: ""
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSearch)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                  <MapPin className="w-4 h-4 text-teal-600" /> Location / City
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Lagos, Abuja, Accra..."
                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                  <Home className="w-4 h-4 text-teal-600" /> Property Type
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 py-6 bg-gray-50 border-gray-200 focus:bg-white">
                      <SelectValue placeholder="Select type (e.g. Apartment)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-teal-100 border-none">
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="hover:text-teal-700">{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                  <Clock className="w-4 h-4 text-teal-600" /> Duration
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 py-6 bg-gray-50 border-gray-200 focus:bg-white">
                      <SelectValue placeholder="How long are you staying?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-teal-100 border-none">
                    {DURATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="hover:text-teal-700">{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField 
            control={form.control} 
            name="moveInDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                  <Calendar className="w-4 h-4 text-teal-600" /> Target Move-in
                </FormLabel>
                <FormControl>
                  <Input type="date" className="h-12 bg-gray-50 border-gray-200 focus:bg-white" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField 
            control={form.control} 
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                  <Wallet className="w-4 h-4 text-teal-600" /> Max Budget
                </FormLabel>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</div>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 500,000" 
                      className="h-12 pl-8 bg-gray-50 border-gray-200 focus:bg-white" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))} 
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <CheckSquare className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-gray-900">Preferred Amenities</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AMENITIES_LIST.map((item) => (
              <FormField key={item.id} control={form.control} name="amenities"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-gray-100 p-3 hover:bg-teal-50 hover:border-teal-200 transition-all cursor-pointer bg-white">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...(field.value || []), item.id])
                            : field.onChange(field.value?.filter((value) => value !== item.id));
                        }}
                        className="data-[state=checked]:bg-teal-700 data-[state=checked]:border-teal-700"
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer flex-1 text-gray-600">
                      {item.label}
                    </FormLabel>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button type="submit" size="lg" disabled={isLoading} className="bg-teal-800 hover:bg-teal-900 text-white min-w-[200px] h-12 text-base shadow-lg hover:shadow-xl transition-all">
            {isLoading ? "Searching..." : (
              <>
                <Search className="w-4 h-4 mr-2" /> Find Apartments
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}