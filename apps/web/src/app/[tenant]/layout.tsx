import { StorefrontAnnouncement } from "@/components/storefront-announcement";
import { StorefrontFooter } from "@/components/storefront-footer";
import { StorefrontNavbar } from "@/components/storefront-navbar";
import { getStorefrontNavData } from "@/lib/storefront/nav-data";
import { getTenantFromSlug } from "@/lib/tenant/server";

export default async function TenantLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}>) {
  const { tenant: tenantSlug } = await params;
  await getTenantFromSlug(tenantSlug);
  const navData = await getStorefrontNavData(tenantSlug);

  return (
    <div className="flex min-h-screen flex-col">
      <StorefrontAnnouncement />
      <StorefrontNavbar data={navData} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter data={navData} />
    </div>
  );
}
