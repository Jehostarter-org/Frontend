import z from "zod";

export const bookingSchema = z.object({
  airport: z.string().min(1, "Please select an airport"),
  terminal: z.string().min(1, "Please select a terminal"),
  pickupPoint: z.string().min(1, "Please select a pickup zone"),
  destination: z.string().min(5, "Please enter a valid destination address"),
  arrivalDate: z.string().min(1, "Please select an arrival date"),
  arrivalTime: z.string().min(1, "Please select an arrival time"),
});
