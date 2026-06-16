import { evlogMiddleware } from "evlog/next";
import { type NextRequest, NextResponse } from "next/server";

import { handleTenantRouting } from "@/lib/tenant/proxy";

const evlog = evlogMiddleware();

export async function proxy(request: NextRequest) {
  const tenantResponse = await handleTenantRouting(request);
  if (tenantResponse) {
    return tenantResponse;
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return evlog(request) ?? NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
