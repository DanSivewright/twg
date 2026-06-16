import type { Route } from "next";
import { redirect } from "next/navigation";

export default async function TenantProductsPage({
  params,
}: Readonly<{
  params: Promise<{ tenant: string }>;
}>) {
  const { tenant: tenantSlug } = await params;

  redirect(`/${tenantSlug}/categories` as Route);
}
