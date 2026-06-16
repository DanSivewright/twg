import { isOrganizationMember } from "@twg/api/modules/tenant";
import { auth } from "@twg/auth";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTenantFromSlug } from "@/lib/tenant/server";

export default async function TenantAdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}>) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantFromSlug(tenantSlug);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/login?callbackUrl=/${tenant.slug}/admin`);
  }

  const isMember = await isOrganizationMember(
    tenant.organizationId,
    session.user.id
  );

  if (!isMember) {
    redirect(`/${tenant.slug}` as Route);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
        <p className="font-medium">Admin (authenticated)</p>
        <p className="text-muted-foreground text-sm">
          Signed in as {session.user.name}. Managing {tenant.name}.
        </p>
      </div>
      {children}
    </div>
  );
}
