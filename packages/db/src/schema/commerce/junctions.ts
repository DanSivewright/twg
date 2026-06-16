import {
  boolean,
  integer,
  pgTable,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { media } from "../media";
import { category } from "./category";
import { product } from "./product";

export const productCategory = pgTable(
  "product_category",
  {
    uid: uuid("uid").defaultRandom().primaryKey(),
    productUid: uuid("product_uid")
      .notNull()
      .references(() => product.uid, { onDelete: "cascade" }),
    categoryUid: uuid("category_uid")
      .notNull()
      .references(() => category.uid, { onDelete: "cascade" }),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("product_category_productUid_categoryUid_uidx").on(
      table.productUid,
      table.categoryUid
    ),
  ]
);

export const productMedia = pgTable(
  "product_media",
  {
    uid: uuid("uid").defaultRandom().primaryKey(),
    productUid: uuid("product_uid")
      .notNull()
      .references(() => product.uid, { onDelete: "cascade" }),
    mediaUid: uuid("media_uid")
      .notNull()
      .references(() => media.uid, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("product_media_productUid_mediaUid_uidx").on(
      table.productUid,
      table.mediaUid
    ),
  ]
);
