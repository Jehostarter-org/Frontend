import { z } from "zod";

export const tenantSearchSchema = z.object({
  city: z.string().min(1, "City is required"),
  moveInDate: z.string().optional(),
  budget: z.number().min(0, "Budget is required"),
  amenities: z.array(z.string()).optional(),
  propertyType: z.string().optional(),
  duration: z.string().optional(),
});

export type TenantSearchData = z.infer<typeof tenantSearchSchema>;