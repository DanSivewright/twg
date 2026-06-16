import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { categoryHref, productHref } from "@/lib/storefront/paths";
import { getTenantFromSlug } from "@/lib/tenant/server";
import { client } from "@/utils/orpc";

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "NOT_FOUND"
  );
}

const CATEGORY_IMAGES: Record<string, string> = {
  ppe: "https://dromex.co.za/wp-content/uploads/2024/10/smelter-j.jpg",
  workwear: "https://dromex.co.za/wp-content/uploads/2026/01/6535-slider.jpg",
  footwear:
    "https://dromex.co.za/wp-content/uploads/2023/10/home-block-img-02.jpg",
  gloves: "https://dromex.co.za/wp-content/uploads/2024/10/arc-glove-j.jpg",
  respiratory:
    "https://dromex.co.za/wp-content/uploads/2025/01/dh-302-slider_lrg.jpg",
};

const DEFAULT_CATEGORY_IMAGE =
  "https://dromex.co.za/wp-content/uploads/2023/10/home-innovation-img-768x372.jpg";

function getCategoryImage(slug: string): string {
  return CATEGORY_IMAGES[slug] ?? DEFAULT_CATEGORY_IMAGE;
}

export default async function CategoriesPage({
  params,
}: Readonly<{
  params: Promise<{ tenant: string; slug?: string[] }>;
}>) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantFromSlug(tenantSlug);
  const slugPath = slug ?? [];

  let result: Awaited<ReturnType<typeof client.storefront.browseCategories>>;

  try {
    result = await client.storefront.browseCategories({ slugPath });
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }

    throw error;
  }

  const pageTitle = result.category?.name ?? "All products";
  const pageDescription = result.category
    ? "Products in this category and its subcategories."
    : "Browse our full range of workwear and personal protective equipment.";

  return (
    <div>
      <section className="relative overflow-hidden bg-foreground py-16 text-background md:py-20">
        <div className="absolute inset-0 opacity-20">
          <Image
            alt=""
            className="object-cover"
            fill
            src={getCategoryImage(
              result.category?.slug ?? slugPath[0] ?? "ppe"
            )}
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-r from-foreground via-foreground/90 to-foreground/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6">
          <nav className="text-background/70 text-sm">
            <Link
              className="hover:text-background hover:underline"
              href={categoryHref(tenant.slug, [])}
            >
              Categories
            </Link>
            {result.breadcrumb.map((item, index) => {
              const path = result.breadcrumb
                .slice(0, index + 1)
                .map((crumb) => crumb.slug);

              return (
                <span key={item.uid}>
                  {" / "}
                  <Link
                    className="hover:text-background hover:underline"
                    href={categoryHref(tenant.slug, path)}
                  >
                    {item.name}
                  </Link>
                </span>
              );
            })}
          </nav>
          <h1 className="mt-4 text-balance font-semibold text-4xl md:text-5xl">
            {pageTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-background/80">{pageDescription}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-6 py-12">
        {result.childCategories.length > 0 ? (
          <section className="space-y-6">
            <h2 className="font-semibold text-2xl">Browse by category</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.childCategories.map((item) => {
                const path = [...slugPath, item.slug];

                return (
                  <li key={item.uid}>
                    <Link
                      className="group relative flex min-h-48 flex-col justify-end overflow-hidden rounded-xl border"
                      href={categoryHref(tenant.slug, path)}
                    >
                      <Image
                        alt={item.name}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        src={getCategoryImage(item.slug)}
                        unoptimized
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"
                      />
                      <span className="relative z-10 p-5 font-semibold text-lg text-white">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-semibold text-2xl">
              Products
              <span className="ml-2 font-normal text-lg text-muted-foreground">
                ({result.products.length})
              </span>
            </h2>
          </div>
          {result.products.length === 0 ? (
            <div className="rounded-xl border border-dashed py-16 text-center">
              <p className="text-muted-foreground">
                No published products in this category yet.
              </p>
              <Link
                className="mt-4 inline-block font-medium text-[#fec900] text-sm hover:underline"
                href={categoryHref(tenant.slug, [])}
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.products.map((item) => (
                <li key={item.uid}>
                  <ProductCard
                    href={productHref(tenant.slug, item.slug)}
                    product={item}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
