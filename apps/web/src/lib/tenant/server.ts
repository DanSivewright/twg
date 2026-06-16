import { resolveTenantBySlug, type Tenant } from "@twg/api/modules/tenant";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export async function getTenantFromSlug(slug: string): Promise<Tenant> {
  const tenant = await resolveTenantBySlug(slug);

  if (!tenant) {
    notFound();
  }

  return tenant;
}

export async function getRequestTenant(): Promise<Tenant | null> {
  const requestHeaders = await headers();
  const slug = requestHeaders.get("x-tenant-slug");

  if (!slug) {
    return null;
  }

  return resolveTenantBySlug(slug);
}
