import { auth } from "@twg/auth";
import type { NextRequest } from "next/server";

import {
  resolveTenantBySlug,
  resolveTenantFromRequest,
  TENANT_COOKIE,
  type Tenant,
} from "./modules/tenant";

export async function createContext(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  const cookieSlug = req.cookies.get(TENANT_COOKIE)?.value;
  const requestHeaders = new Headers(req.headers);

  let tenant = await resolveTenantFromRequest({
    host: req.headers.get("host") ?? "",
    pathname: req.nextUrl.pathname,
    headers: requestHeaders,
  });

  if (!tenant && cookieSlug) {
    tenant = await resolveTenantBySlug(cookieSlug);
  }

  return {
    auth: null,
    session,
    tenant,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
export type { Tenant };
