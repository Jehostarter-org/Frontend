import * as z from "zod";

export const vehicleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.union([z.number(), z.string()]).transform((val) => Number(val)).refine((val) => val > 0, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  productCondition: z.string().min(1, "Condition is required"),
  brand: z.string().optional(),
  availability: z.string().min(1, "Availability is required"),
  productLimit: z.union([z.number(), z.string()]).transform((val) => Number(val) || 1).refine((val) => val >= 1),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  meetupPreference: z.string().min(1, "Preference is required"),
  productImages: z.array(z.any()).min(1, "At least one image is required"),
});

export type VehicleFormData = z.input<typeof vehicleSchema>;

export const VEHICLE_CATEGORIES = [
  { label: "Cars", value: "CARS" },
  { label: "Motorcycles", value: "MOTORCYCLES" },
  { label: "Trucks", value: "TRUCKS" },
];

export const VEHICLE_CONDITIONS = [
  { label: "New", value: "NEW" },
  { label: "Used", value: "USED" },
  { label: "Foreign Used", value: "FOREIGN_USED" },
];