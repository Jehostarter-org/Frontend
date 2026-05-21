// schemas/driver-schema.ts
import { z } from "zod";

export const driverRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  nationalIdentityNumber: z.string().min(5, "National ID is required"),
  licensePlateNumber: z.string().min(5, "License number is required"),
  emergencyContact: z.string().optional(),
  licenseStateCountry: z.string().min(2, "State/Country location required"),
  licenseExpirationDate: z.string().min(1, "Expiration date required"),
  vehicleModel: z.string().min(2, "Vehicle model required"),
  vehicleYear: z.string().min(4, "Year required"),
  licenseNumber: z.string().min(2, "License number required"),
  vehicleColour: z.string().min(2, "Colour required"),
  vin: z.string().optional(),
  driverLicenseImage: z.any().refine((file) => file instanceof File, "License image is required"),
  frontViewPicture: z.any().refine((file) => file instanceof File, "Front view required"),
  backViewPicture: z.any().refine((file) => file instanceof File, "Back view required"),
  plateNumberFrontViewPicture: z.any().refine((file) => file instanceof File, "Plate image required"),
  plateNumberBackViewPicture: z.any().refine((file) => file instanceof File, "Plate back image required"),
});

export type DriverFormData = z.infer<typeof driverRegistrationSchema>;

