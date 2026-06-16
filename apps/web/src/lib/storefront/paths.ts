import type { Route } from "next";

export function tenantHomeHref(tenantSlug: string): Route {
  return `/${tenantSlug}` as Route;
}

export function categoryHref(tenantSlug: string, slugPath: string[]): Route {
  if (slugPath.length === 0) {
    return `/${tenantSlug}/categories` as Route;
  }

  return `/${tenantSlug}/categories/${slugPath.join("/")}` as Route;
}

export function productHref(tenantSlug: string, slug: string): Route {
  return `/${tenantSlug}/products/${slug}` as Route;
}
