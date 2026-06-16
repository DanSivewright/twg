import { fallbackStorefrontNavData } from "@/lib/storefront/nav-data";

import { StorefrontNavbar } from "./storefront-navbar";

export default function Header() {
  return <StorefrontNavbar data={fallbackStorefrontNavData} />;
}
