import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@twg/ui/components/button";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { categoryHref } from "@/lib/storefront/paths";
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

export default async function ProductDetailPage({
  params,
}: Readonly<{
  params: Promise<{ tenant: string; slug: string }>;
}>) {
  const { tenant: tenantSlug, slug } = await params;
  const tenant = await getTenantFromSlug(tenantSlug);

  let product: Awaited<ReturnType<typeof client.storefront.getProductBySlug>>;

  try {
    product = await client.storefront.getProductBySlug({ slug });
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }

    throw error;
  }

  const primaryImage =
    product.media.find((item) => item.isPrimary) ?? product.media[0];
  const galleryImages = product.media.filter(
    (item) => item.uid !== primaryImage?.uid
  );

  return (
    <div>
      <div className="border-b bg-muted/30">
        <nav className="mx-auto max-w-7xl px-6 py-4 text-muted-foreground text-sm">
          <Link
            className="hover:text-foreground hover:underline"
            href={categoryHref(tenant.slug, [])}
          >
            Categories
          </Link>
          {product.categories[0] ? (
            <>
              {" / "}
              <Link
                className="hover:text-foreground hover:underline"
                href={categoryHref(tenant.slug, product.categories[0].slugPath)}
              >
                {product.categories[0].name}
              </Link>
            </>
          ) : null}
          {" / "}
          <span className="text-foreground">{product.title}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            {primaryImage ? (
              <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
                <Image
                  alt={primaryImage.altText ?? product.title}
                  className="object-contain p-4"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={primaryImage.url}
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
                No image available
              </div>
            )}
            {galleryImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {galleryImages.map((item) => (
                  <div
                    className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                    key={item.uid}
                  >
                    <Image
                      alt={item.altText ?? product.title}
                      className="object-contain p-2"
                      fill
                      sizes="100px"
                      src={item.url}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-balance font-semibold text-3xl md:text-4xl">
                {product.title}
              </h1>
              {product.productCode ? (
                <p className="text-muted-foreground">
                  Product code:{" "}
                  <span className="font-mono">{product.productCode}</span>
                </p>
              ) : null}
            </div>

            {product.shortDescription ? (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                className="h-12 rounded-full bg-[#fec900] pr-3 pl-5 text-black hover:bg-[#fec900]/80"
                size="lg"
              >
                Enquire now
                <HugeiconsIcon icon={ChevronRightIcon} />
              </Button>
              {product.datasheetUrl ? (
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full border px-6 font-medium text-sm transition-colors hover:bg-muted"
                  href={product.datasheetUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  View datasheet
                </a>
              ) : null}
            </div>

            {product.categories.length > 0 ? (
              <div className="space-y-2 border-t pt-6">
                <p className="font-medium text-sm uppercase tracking-wider">
                  Categories
                </p>
                <ul className="flex flex-wrap gap-2">
                  {product.categories.map((item) => (
                    <li key={item.uid}>
                      <Link
                        className="inline-block rounded-full border px-3 py-1 text-sm transition-colors hover:bg-muted"
                        href={categoryHref(tenant.slug, item.slugPath)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {product.variants.length > 0 ? (
              <div className="space-y-3 border-t pt-6">
                <p className="font-medium text-sm uppercase tracking-wider">
                  Available variants
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {product.variants.map((variant) => (
                    <li
                      className="rounded-lg border bg-card px-4 py-3 text-sm"
                      key={variant.uid}
                    >
                      <span className="font-medium">{variant.sku}</span>
                      {variant.size || variant.colour ? (
                        <span className="mt-0.5 block text-muted-foreground">
                          {[variant.size, variant.colour]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {product.description ? (
          <section className="mt-16 max-w-3xl space-y-4 border-t pt-12">
            <h2 className="font-semibold text-2xl">Product details</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </section>
        ) : null}

        {product.attributes?.features &&
        Array.isArray(product.attributes.features) &&
        product.attributes.features.length > 0 ? (
          <section className="mt-12 max-w-3xl space-y-4">
            <h2 className="font-semibold text-2xl">Features</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {product.attributes.features.map((feature) => (
                <li
                  className="flex items-start gap-2 text-muted-foreground text-sm"
                  key={feature}
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#fec900]" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {product.sourceUrl ? (
          <p className="mt-8 text-muted-foreground text-xs">
            <a
              className="underline hover:text-foreground"
              href={product.sourceUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              View original product page
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
