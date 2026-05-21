import { z } from "zod";

export const tenantSearchSchema = z.object({
  moveInDate: z.string().min(1, "Date is required"),
  budget: z.number().min(1, "Budget is required"),
  amenities: z.array(z.string()).optional(),
  propertyType: z.string().optional(), 
  duration: z.string().optional(),
});

export type TenantSearchData = z.infer<typeof tenantSearchSchema>;