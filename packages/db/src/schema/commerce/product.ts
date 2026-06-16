import {
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organization } from "../auth";
import { productStatusEnum } from "../constants/enums";
import { TIMESTAMP_DEFAULTS } from "../timestamps";

export const product = pgTable(
  "product",
  {
    uid: uuid("uid").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    productCode: text("product_code"),
    shortDescription: text("short_description"),
    description: text("description"),
    datasheetUrl: text("datasheet_url"),
    sourceUrl: text("source_url"),
    attributes: jsonb("attributes"),
    status: productStatusEnum("status").default("draft").notNull(),
    ...TIMESTAMP_DEFAULTS,
  },
  (table) => [
    index("product_organizationId_idx").on(table.organizationId),
    index("product_organizationId_status_idx").on(
      table.organizationId,
      table.status
    ),
    uniqueIndex("product_organizationId_slug_uidx").on(
      table.organizationId,
      table.slug
    ),
  ]
);
