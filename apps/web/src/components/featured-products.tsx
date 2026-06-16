import type { Route } from "next";
import Link from "next/link";

import { ProductCard, type ProductCardItem } from "@/components/product-card";
import { productHref } from "@/lib/storefront/paths";

interface FeaturedProductsProps {
  products: ProductCardItem[];
  tenantSlug: string;
  title?: string;
  viewAllHref: Route;
}

export function FeaturedProducts({
  products,
  tenantSlug,
  title = "New Products",
  viewAllHref,
}: FeaturedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-semibold text-3xl md:text-4xl">{title}</h2>
          <Link
            className="font-medium text-[#fec900] text-sm underline-offset-4 hover:underline"
            href={viewAllHref}
          >
            Explore the latest
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              href={productHref(tenantSlug, product.slug)}
              key={product.uid}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
