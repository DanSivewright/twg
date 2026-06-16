import { z } from "zod";

export const productAttributesSchema = z
  .object({
    composition: z.string().optional(),
    fabricWeight: z.string().optional(),
    features: z.array(z.string()).optional(),
    suitableFor: z.array(z.string()).optional(),
  })
  .passthrough();

export type ProductAttributes = z.infer<typeof productAttributesSchema>;
