import { z } from "zod";

export const availabilitySchema = z.object({
  pickupLocation: z.string().min(1, "Please select the airport where you are available"),
  availabilitySchedule: z.string().min(1, "Please set your availability time"), 
});

export type AvailabilityFormValues = z.infer<typeof availabilitySchema>;