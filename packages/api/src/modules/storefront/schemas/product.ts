import { z } from "zod";

export const productListItemSchema = z.object({
  uid: z.uuid(),
  title: z.string(),
  slug: z.string(),
  productCode: z.string().nullable(),
  primaryImageUrl: z.string().nullable(),
});

export const getProductBySlugInputSchema = z.object({
  slug: z.string().min(1),
});

export const productVariantSchema = z.object({
  uid: z.uuid(),
  sku: z.string(),
  size: z.string().nullable(),
  colour: z.string().nullable(),
});

export const productCategoryRefSchema = z.object({
  uid: z.uuid(),
  name: z.string(),
  slug: z.string(),
  slugPath: z.array(z.string()),
  isPrimary: z.boolean(),
});

export const productMediaSchema = z.object({
  uid: z.uuid(),
  url: z.string(),
  altText: z.string().nullable(),
  isPrimary: z.boolean(),
});

export const productAttributesSchema = z
  .object({
    composition: z.string().optional(),
    fabricWeight: z.string().optional(),
    features: z.array(z.string()).optional(),
    suitableFor: z.array(z.string()).optional(),
    standards: z.array(z.string()).optional(),
    colours: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
  })
  .passthrough();

export const productDetailSchema = z.object({
  uid: z.uuid(),
  title: z.string(),
  slug: z.string(),
  productCode: z.string().nullable(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  datasheetUrl: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  attributes: productAttributesSchema.nullable(),
  variants: z.array(productVariantSchema),
  categories: z.array(productCategoryRefSchema),
  media: z.array(productMediaSchema),
});
