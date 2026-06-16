import Link from "next/link";

import type { StorefrontNavData } from "@/lib/storefront/nav-data";
import { categoryHref, tenantHomeHref } from "@/lib/storefront/paths";

interface StorefrontFooterProps {
  data: StorefrontNavData;
}

export function StorefrontFooter({ data }: StorefrontFooterProps) {
  const homeHref = tenantHomeHref(data.tenantSlug);
  const allProductsHref = categoryHref(data.tenantSlug, []);

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <Link
              className="font-semibold text-lg tracking-tight"
              href={homeHref}
            >
              {data.tenantName}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Helping to bring you home safely. Workwear &amp; PPE tested to the
              highest international standards.
            </p>
          </div>

          {data.storeColumns.map((column) => (
            <div className="space-y-3" key={column.title}>
              <p className="font-semibold text-sm uppercase tracking-wider">
                {column.title}
              </p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-muted-foreground text-sm hover:text-foreground"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-3">
            <p className="font-semibold text-sm uppercase tracking-wider">
              Company
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-muted-foreground text-sm hover:text-foreground"
                  href={allProductsHref}
                >
                  All products
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">
                  Find a store
                </span>
              </li>
              <li>
                <span className="text-muted-foreground text-sm">
                  Contact us
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 text-muted-foreground text-xs sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {data.tenantName}. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms &amp; Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
