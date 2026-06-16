import { timestamp } from "drizzle-orm/pg-core";

export const TIMESTAMP_DEFAULTS = {
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .defaultNow()
    .$onUpdate(() => new Date().toISOString()),
};
