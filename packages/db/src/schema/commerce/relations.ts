import { relations } from "drizzle-orm";

import { organization, user } from "../auth";
import { media } from "../media";
import { category } from "./category";
import { productCategory, productMedia } from "./junctions";
import { product } from "./product";
import { productVariant } from "./product-variant";

export const categoryRelations = relations(category, ({ one, many }) => ({
  organization: one(organization, {
    fields: [category.organizationId],
    references: [organization.id],
  }),
  parentCategory: one(category, {
    fields: [category.parentCategoryUid],
    references: [category.uid],
    relationName: "categoryHierarchy",
  }),
  childCategories: many(category, {
    relationName: "categoryHierarchy",
  }),
  productCategories: many(productCategory),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  organization: one(organization, {
    fields: [product.organizationId],
    references: [organization.id],
  }),
  variants: many(productVariant),
  productCategories: many(productCategory),
  productMedia: many(productMedia),
}));

export const productVariantRelations = relations(productVariant, ({ one }) => ({
  product: one(product, {
    fields: [productVariant.productUid],
    references: [product.uid],
  }),
}));

export const productCategoryRelations = relations(
  productCategory,
  ({ one }) => ({
    product: one(product, {
      fields: [productCategory.productUid],
      references: [product.uid],
    }),
    category: one(category, {
      fields: [productCategory.categoryUid],
      references: [category.uid],
    }),
  })
);

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(product, {
    fields: [productMedia.productUid],
    references: [product.uid],
  }),
  media: one(media, {
    fields: [productMedia.mediaUid],
    references: [media.uid],
  }),
}));

export const mediaRelations = relations(media, ({ one, many }) => ({
  organization: one(organization, {
    fields: [media.organizationId],
    references: [organization.id],
  }),
  author: one(user, {
    fields: [media.authorId],
    references: [user.id],
  }),
  productMedia: many(productMedia),
}));
