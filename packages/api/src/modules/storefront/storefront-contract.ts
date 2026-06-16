import { oc } from "@orpc/contract";
import { z } from "zod";

import {
  browseCategoriesInputSchema,
  browseCategoriesResultSchema,
} from "./schemas/category";
import {
  getProductBySlugInputSchema,
  productDetailSchema,
  productListItemSchema,
} from "./schemas/product";
import { tenantInfoSchema } from "./schemas/tenant";

export const storefrontInfoContract = oc.output(tenantInfoSchema);

export const listProductsContract = oc.output(z.array(productListItemSchema));

export const browseCategoriesContract = oc
  .input(browseCategoriesInputSchema)
  .output(browseCategoriesResultSchema);

export const getProductBySlugContract = oc
  .input(getProductBySlugInputSchema)
  .output(productDetailSchema);

export const storefrontContract = {
  info: storefrontInfoContract,
  listProducts: listProductsContract,
  browseCategories: browseCategoriesContract,
  getProductBySlug: getProductBySlugContract,
};
