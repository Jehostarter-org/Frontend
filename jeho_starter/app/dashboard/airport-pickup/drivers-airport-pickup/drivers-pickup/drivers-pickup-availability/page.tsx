"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProgressBar } from "@/components/reuseables/progress-bar";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { DateTimePicker } from "@/components/reuseables/dateTimePicker";
import { SmartLocationInput } from "@/components/inputs/smartGeoLocation";
import { ArrowLeft, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useSetAvailabilityLocationMutation } from "@/lib/api/driverApiSlice";
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { availabilitySchema, AvailabilityFormValues } from "@/components/types/schemas/availability-scehma";


export default function DriverPickupAvailability() {
  const router = useRouter();
  const [setAvailabilityLocation, { isLoading }] = useSetAvailabilityLocationMutation();
  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      pickupLocation: "",
      availabilitySchedule: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: AvailabilityFormValues) => {
    try {
      await setAvailabilityLocation({
        pickupLocation: data.pickupLocation,
        availabilitySchedule: data.availabilitySchedule,
      }).unwrap();
      
      toast.success("Airport pickup activated successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error setting availability:", error);
      toast.error("Failed to activate pickup. Please try again.");
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-5xl mx-auto px-5 animate-in fade-in duration-500">
        <div className="py-1">
          <Button variant="ghost" className="mb-6 md:-ml-60 bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => router.back()} >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-5 lg:p-12">
            
            <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-gray-900">
              Airport Pickup Activation
            </h1>

            <ProgressBar step={3} totalSteps={4} />

            <div className="mt-1 mb-1 max-w-lg mx-auto">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <h2 className="text-xl font-semibold text-center text-gray-900">
                      Driver`s Details
                    </h2>
                  <FormField control={form.control} name="pickupLocation" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-900">
                            Driver`s current location.  
                        </FormLabel>
                        {/* <div className="p-4 border rounded-xl bg-gray-50/50 space-y-2">
                            <SmartAirportSelect
                              register={form.register as unknown as UseFormRegister<FieldValues>}
                              setValue={form.setValue as unknown as UseFormSetValue<FieldValues>}
                              error={form.formState.errors.pickupLocation?.message}
                              fieldName="pickupLocation"
                              availabilitySchedule={form.watch("availabilitySchedule")}
                              pickupLocation={field.value}
                              onOpenSchedule={(date, time, formattedString) => {}}
                              onOpenLocation={(location) => field.onChange(location)}
                            />
                        </div> */}
                        <SmartLocationInput
                          mode="airport" 
                          value={field.value}
                          onChange={field.onChange}
                          error={form.formState.errors.pickupLocation?.message}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField control={form.control} name="availabilitySchedule" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold text-gray-900">
                            When are you available?
                        </FormLabel>
                        <div className="relative flex">
                            <FormControl>
                                <DateTimePicker value={field.value} onSave={(date, time, formattedString) => field.onChange(formattedString)} />
                            </FormControl>
                        </div>
                        <p className="text-xs text-gray-500">
                            Select the time you will be ready at the terminal.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading || !form.formState.isValid} className="w-full bg-[#2d7a7a] hover:bg-[#246060] text-white py-6 text-lg font-medium shadow-md transition-all" >
                    {isLoading ? ( <> <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Activating... </> ) : ( "Activate Availability" )}
                  </Button>

                </form>
              </Form>
            </div>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
