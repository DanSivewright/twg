import { pgEnum } from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
]);

export const mediaUsageEnum = pgEnum("media_usage", [
  "any",
  "product",
  "category",
  "avatar",
]);

export const preferredColorEnum = pgEnum("preferred_color", [
  "vibrant",
  "dark_vibrant",
  "light_vibrant",
  "muted",
  "dark_muted",
  "light_muted",
]);
