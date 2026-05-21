import * as z from "zod";

export const CATEGORIES = [
  { value: "BABY_AND_KIDS", label: "Baby's & Kids" },
  { value: "BOOK_AND_STUDY_AIDS", label: "Books & Study Aids" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "WORK_TOOLS_AND_EQUIPMENT", label: "Equipment & Tools" },
  { value: "FASHION_AND_PERSONAL_ITEMS", label: "Fashion" },
  { value: "HOME_AND_FURNITURE", label: "Furniture" },
  { value: "HOUSING_AND_RENT", label: "Housing" },
  { value: "VEHICLES", label: "Vehicles" },
] as const;

export const CONDITIONS = [
  { value: "BRAND_NEW", label: "New" },
  { value: "USED", label: "Used - Like New" },
  { value: "FAIR", label: "Used - Fair" },
] as const;

export const AVAILABILITY = [
  { value: "STOCK", label: "In Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
] as const;

export const MEETUP_PREFERENCES = [
  { value: "DOOR_DROP_OFF", label: "Home Delivery" },
  { value: "DOOR_PICK_UP", label: "Pickup at my place" },
  { value: "PUBLIC_MEET_UP", label: "Public Meetup" },
] as const;

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be detailed"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(1, "Price must be greater than 0"),
  productCondition: z.string().min(1, "Condition is required"),
  brand: z.string().optional(),
  availability: z.string().min(1, "Availability is required"),
  productLimit: z.number().min(1),
  location: z.string().min(1, "Location is required"),
  meetupPreference: z.string().min(1, "Preference is required"),
  productImages: z.array(z.instanceof(File)).min(1, "At least one image is required").max(5, "Max 5 images"),
});

export type ProductFormData = z.infer<typeof productSchema>;




export const vehicleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  productCondition: z.string().min(1, "Condition is required"),
  brand: z.string().optional(),
  availability: z.string().min(1, "Availability is required"),
  productLimit: z.coerce.number().min(1).default(1),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  meetupPreference: z.string().min(1, "Preference is required"),
  productImages: z.array(z.any()).min(1, "At least one image is required"),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

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