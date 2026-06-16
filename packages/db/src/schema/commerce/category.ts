import {
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organization } from "../auth";
import { TIMESTAMP_DEFAULTS } from "../timestamps";

export const category = pgTable(
  "category",
  {
    uid: uuid("uid").defaultRandom().primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    parentCategoryUid: uuid("parent_category_uid"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...TIMESTAMP_DEFAULTS,
  },
  (table) => [
    index("category_organizationId_idx").on(table.organizationId),
    index("category_parentCategoryUid_idx").on(table.parentCategoryUid),
    uniqueIndex("category_organizationId_slug_uidx").on(
      table.organizationId,
      table.slug
    ),
    foreignKey({
      columns: [table.parentCategoryUid],
      foreignColumns: [table.uid],
      name: "category_parent_category_uid_fkey",
    }),
  ]
);
