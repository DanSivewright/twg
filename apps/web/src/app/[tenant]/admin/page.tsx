import { getTenantFromSlug } from "@/lib/tenant/server";

export default async function TenantAdminPage({
  params,
}: Readonly<{
  params: Promise<{ tenant: string }>;
}>) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantFromSlug(tenantSlug);

  return (
    <div className="space-y-3 rounded-lg border p-6">
      <h1 className="font-semibold text-xl">Catalog admin</h1>
      <p className="text-muted-foreground text-sm">
        Placeholder for {tenant.name} back-office tools: products, categories,
        media, and organization settings.
      </p>
      <ul className="list-inside list-disc text-sm">
        <li>Product editor</li>
        <li>Category tree</li>
        <li>Media library</li>
        <li>Store domain settings</li>
      </ul>
    </div>
  );
}
