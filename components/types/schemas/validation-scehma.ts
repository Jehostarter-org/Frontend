import { z } from "zod";

export const driverAvailabilitySchema = z.object({
  pickupLocation: z.string().min(1, "Please select the airport you are available at"),
  availabilitySchedule: z.string().min(1, "Please select your available date and time"),
});

type DriverAvailabilityData = z.infer<typeof driverAvailabilitySchema>;