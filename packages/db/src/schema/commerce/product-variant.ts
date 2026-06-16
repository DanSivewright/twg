import {
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { TIMESTAMP_DEFAULTS } from "../timestamps";
import { product } from "./product";

export const productVariant = pgTable(
  "product_variant",
  {
    uid: uuid("uid").defaultRandom().primaryKey(),
    productUid: uuid("product_uid")
      .notNull()
      .references(() => product.uid, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    size: text("size"),
    colour: text("colour"),
    options: jsonb("options"),
    ...TIMESTAMP_DEFAULTS,
  },
  (table) => [
    index("product_variant_productUid_idx").on(table.productUid),
    uniqueIndex("product_variant_productUid_sku_uidx").on(
      table.productUid,
      table.sku
    ),
  ]
);
