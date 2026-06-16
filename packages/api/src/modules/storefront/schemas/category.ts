import { z } from "zod";

import { productListItemSchema } from "./product";

export const categoryRefSchema = z.object({
  uid: z.uuid(),
  name: z.string(),
  slug: z.string(),
});

export const browseCategoriesInputSchema = z.object({
  slugPath: z.array(z.string().min(1)).default([]),
});

export const browseCategoriesResultSchema = z.object({
  category: categoryRefSchema.nullable(),
  breadcrumb: z.array(categoryRefSchema),
  childCategories: z.array(categoryRefSchema),
  products: z.array(productListItemSchema),
});
