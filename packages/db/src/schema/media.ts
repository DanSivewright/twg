import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { mediaUsageEnum, preferredColorEnum } from "./constants/enums";
import { TIMESTAMP_DEFAULTS } from "./timestamps";

/** Creates media table defaults with an author reference. Use this to avoid circular imports. */
export function createMediaTableDefaults(authorTable: { id: AnyPgColumn }) {
  return {
    uid: uuid("uid").defaultRandom().primaryKey(),
    url: text("url").notNull(),
    path: text("path"),
    fileName: text("file_name").notNull(),
    altText: text("alt_text"),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    usage: mediaUsageEnum("usage").default("any"),
    authorId: text("author_id").references(() => authorTable.id, {
      onDelete: "set null",
    }),
    preferredColor: preferredColorEnum("preferred_color").default("vibrant"),

    vibrantHex: text("vibrant_hex"),
    vibrantRgb: text("vibrant_rgb"),
    vibrantTitle: text("vibrant_title"),
    vibrantBody: text("vibrant_body"),

    darkVibrantHex: text("dark_vibrant_hex"),
    darkVibrantRgb: text("dark_vibrant_rgb"),
    darkVibrantTitle: text("dark_vibrant_title"),
    darkVibrantBody: text("dark_vibrant_body"),

    lightVibrantHex: text("light_vibrant_hex"),
    lightVibrantRgb: text("light_vibrant_rgb"),
    lightVibrantTitle: text("light_vibrant_title"),
    lightVibrantBody: text("light_vibrant_body"),

    mutedHex: text("muted_hex"),
    mutedRgb: text("muted_rgb"),
    mutedTitle: text("muted_title"),
    mutedBody: text("muted_body"),

    darkMutedHex: text("dark_muted_hex"),
    darkMutedRgb: text("dark_muted_rgb"),
    darkMutedTitle: text("dark_muted_title"),
    darkMutedBody: text("dark_muted_body"),

    lightMutedHex: text("light_muted_hex"),
    lightMutedRgb: text("light_muted_rgb"),
    lightMutedTitle: text("light_muted_title"),
    lightMutedBody: text("light_muted_body"),

    ...TIMESTAMP_DEFAULTS,
  } as const;
}

export const media = pgTable(
  "media",
  {
    ...createMediaTableDefaults(user),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
  },
  (table) => [index("media_organizationId_idx").on(table.organizationId)]
);
