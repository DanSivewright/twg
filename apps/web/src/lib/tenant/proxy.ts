import {
  parsePathTenantSlug,
  parseSubdomainTenantSlug,
  resolveTenantByHost,
  resolveTenantBySlug,
  TENANT_COOKIE,
  TENANT_ORG_ID_HEADER,
  TENANT_SLUG_HEADER,
  type Tenant,
} from "@twg/api/modules/tenant";
import { type NextRequest, NextResponse } from "next/server";

const PLATFORM_PREFIXES = ["/api", "/_next", "/login", "/dashboard"];

function shouldSkipTenantRouting(pathname: string): boolean {
  return PLATFORM_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function withTenantHeaders(request: NextRequest, tenant: Tenant): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_SLUG_HEADER, tenant.slug);
  requestHeaders.set(TENANT_ORG_ID_HEADER, tenant.organizationId);
  requestHeaders.set("x-tenant-name", tenant.name);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(TENANT_COOKIE, tenant.slug, {
    path: "/",
    sameSite: "lax",
  });

  return response;
}

function rewriteToTenantPath(
  request: NextRequest,
  tenant: Tenant,
  pathname: string
): NextResponse {
  const suffix = pathname === "/" ? "" : pathname;
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = `/${tenant.slug}${suffix}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_SLUG_HEADER, tenant.slug);
  requestHeaders.set(TENANT_ORG_ID_HEADER, tenant.organizationId);
  requestHeaders.set("x-tenant-name", tenant.name);

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  response.cookies.set(TENANT_COOKIE, tenant.slug, {
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export async function handleTenantRouting(
  request: NextRequest
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  if (shouldSkipTenantRouting(pathname)) {
    const host = request.headers.get("host") ?? "";
    const hostTenant = await resolveTenantByHost(host);

    if (hostTenant) {
      return withTenantHeaders(request, hostTenant);
    }

    return null;
  }

  const host = request.headers.get("host") ?? "";
  const hostTenant = await resolveTenantByHost(host);

  if (hostTenant && !pathname.startsWith(`/${hostTenant.slug}`)) {
    return rewriteToTenantPath(request, hostTenant, pathname);
  }

  const pathSlug = parsePathTenantSlug(pathname);
  if (pathSlug) {
    const pathTenant = await resolveTenantBySlug(pathSlug);
    if (pathTenant) {
      return withTenantHeaders(request, pathTenant);
    }
  }

  const subdomainSlug = parseSubdomainTenantSlug(host);
  if (subdomainSlug) {
    const subdomainTenant = await resolveTenantBySlug(subdomainSlug);
    if (subdomainTenant) {
      return withTenantHeaders(request, subdomainTenant);
    }
  }

  return null;
}
