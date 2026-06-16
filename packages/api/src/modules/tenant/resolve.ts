import { env } from "@twg/env/server";

import {
  findOrganizationBySlug,
  findOrganizationByStoreDomain,
  type OrganizationTenant,
} from "./tenant";

export const TENANT_SLUG_HEADER = "x-tenant-slug";
export const TENANT_ORG_ID_HEADER = "x-organization-id";
export const TENANT_COOKIE = "twg-tenant-slug";

/** Platform routes that must not be interpreted as organization slugs. */
export const RESERVED_TENANT_SLUGS = new Set([
  "api",
  "dashboard",
  "login",
  "_next",
  "favicon.ico",
]);

export type Tenant = OrganizationTenant;

const TRAILING_DOT_REGEX = /\.$/;

function getStoreBaseDomain(): string {
  return env.STORE_BASE_DOMAIN ?? new URL(env.CORS_ORIGIN).host;
}

export function isReservedTenantSlug(slug: string): boolean {
  return RESERVED_TENANT_SLUGS.has(slug);
}

export function parseSubdomainTenantSlug(host: string): string | null {
  const baseDomain = getStoreBaseDomain();
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  const baseHostname = baseDomain.split(":")[0]?.toLowerCase() ?? "";

  if (!hostname.endsWith(baseHostname)) {
    return null;
  }

  const prefix = hostname
    .slice(0, -baseHostname.length)
    .replace(TRAILING_DOT_REGEX, "");
  if (!prefix || prefix.includes(".")) {
    return null;
  }

  const slug = prefix.toLowerCase();
  return isReservedTenantSlug(slug) ? null : slug;
}

export function parsePathTenantSlug(pathname: string): string | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment || isReservedTenantSlug(segment)) {
    return null;
  }

  return segment.toLowerCase();
}

export function tenantFromHeaders(headers: Headers): Tenant | null {
  const slug = headers.get(TENANT_SLUG_HEADER);
  const organizationId = headers.get(TENANT_ORG_ID_HEADER);

  if (!(slug && organizationId)) {
    return null;
  }

  return {
    slug,
    organizationId,
    name: headers.get("x-tenant-name") ?? slug,
  };
}

export function resolveTenantBySlug(slug: string): Promise<Tenant | null> {
  return findOrganizationBySlug(slug);
}

export async function resolveTenantByHost(
  host: string
): Promise<Tenant | null> {
  const subdomainSlug = parseSubdomainTenantSlug(host);
  if (subdomainSlug) {
    return resolveTenantBySlug(subdomainSlug);
  }

  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  const baseHostname = getStoreBaseDomain().split(":")[0]?.toLowerCase() ?? "";

  if (!hostname || hostname === baseHostname) {
    return null;
  }

  return findOrganizationByStoreDomain(hostname);
}

export async function resolveTenantFromRequest(input: {
  host: string;
  pathname: string;
  headers: Headers;
}): Promise<Tenant | null> {
  const fromHeaders = tenantFromHeaders(input.headers);
  if (fromHeaders) {
    return resolveTenantBySlug(fromHeaders.slug);
  }

  const hostTenant = await resolveTenantByHost(input.host);
  if (hostTenant) {
    return hostTenant;
  }

  const pathSlug = parsePathTenantSlug(input.pathname);
  if (!pathSlug) {
    return null;
  }

  return resolveTenantBySlug(pathSlug);
}
