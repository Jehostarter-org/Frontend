import { z } from "zod";

export const ownerStep1Schema = z.object({
  propertyTitle: z.string().min(5, "Title must be at least 5 characters"),
  propertyType: z.string().min(1, "Please select a property type"),
  rentalType: z.string().min(1, "Please select a rental type"),
  description: z.string().min(20, "Please provide a detailed description (min 20 chars)"),
  address: z.string().min(5, "Address is required"),
  nearestLandmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
});


export const ownerStep2Schema = z.object({
  bedrooms: z.string().min(1, "At least 1 bedroom is required"),
  bathrooms: z.string().min(1, "At least 1 bathroom is required"),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.union([z.instanceof(File), z.string()])).min(1, "Please upload at least one image"),
});


export const ownerStep3Schema = z.object({
    availableFrom: z.string().min(1, "Availability date is required"),
    priceAmount: z.string().min(1, "Listing price is required"),
    priceType: z.string().min(1, "Please select a pricing model"),
    securityDeposit: z.boolean().optional(),
    minStayDuration: z.string().optional(),
    maxStayDuration: z.string().optional(),
    houseRules: z.array(z.string()).optional(),
});



export type OwnerStep1Values = z.infer<typeof ownerStep1Schema>;
export type OwnerStep2Values = z.infer<typeof ownerStep2Schema>;
export type OwnerStep3Values = z.infer<typeof ownerStep3Schema>;
