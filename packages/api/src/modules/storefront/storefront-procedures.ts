import { ORPCError } from "@orpc/server";

import { implementer } from "../../implement/os";
import { requireTenant } from "../../middleware/tenant";
import {
  browseCategoriesBySlugPath,
  getPublishedProductBySlug,
  listPublishedProducts,
} from "./storefront";

export const storefrontInfo = implementer.storefront.info
  .use(requireTenant)
  .handler(({ context }) => ({
    organizationId: context.tenant.organizationId,
    slug: context.tenant.slug,
    name: context.tenant.name,
  }));

export const listProducts = implementer.storefront.listProducts
  .use(requireTenant)
  .handler(async ({ context }) =>
    listPublishedProducts(context.tenant.organizationId)
  );

export const browseCategories = implementer.storefront.browseCategories
  .use(requireTenant)
  .handler(async ({ context, input }) => {
    const result = await browseCategoriesBySlugPath(
      context.tenant.organizationId,
      input.slugPath
    );

    if (!result) {
      throw new ORPCError("NOT_FOUND", {
        message: "Category path not found",
      });
    }

    return result;
  });

export const getProductBySlug = implementer.storefront.getProductBySlug
  .use(requireTenant)
  .handler(async ({ context, input }) => {
    const product = await getPublishedProductBySlug(
      context.tenant.organizationId,
      input.slug
    );

    if (!product) {
      throw new ORPCError("NOT_FOUND", {
        message: "Product not found",
      });
    }

    return product;
  });

export const storefrontRouter = {
  info: storefrontInfo,
  listProducts,
  browseCategories,
  getProductBySlug,
};
