import { cn } from "@twg/ui/lib/utils";
import Image from "next/image";

import { AboutSection } from "@/components/about-section";
import { CustomerStories } from "@/components/customer-stories";
import { FeaturedProducts } from "@/components/featured-products";
import { HeroCarousel } from "@/components/hero-carousel";
import { PromoTiles } from "@/components/promo-tiles";
import SecondaryHero from "@/components/secondary-hero";
import { getHeroSlides } from "@/lib/storefront/hero-slides";
import { categoryHref } from "@/lib/storefront/paths";
import { getPromoTiles } from "@/lib/storefront/promo-tiles";
import { getTenantFromSlug } from "@/lib/tenant/server";
import { client } from "@/utils/orpc";

interface BentoTileProps {
  alt: string;
  className?: string;
  height: number;
  src: string;
  width: number;
}

function BentoTile({ alt, className, height, src, width }: BentoTileProps) {
  return (
    <div
      className={cn(
        "group relative h-full min-h-44 overflow-hidden rounded-2xl shadow-black/3 shadow-md before:absolute before:inset-0 before:z-1 before:rounded-2xl before:border before:border-foreground/6.5 hover:z-10",
        className
      )}
    >
      <Image
        alt={alt}
        className="size-full object-cover not-group-hover:grayscale duration-300"
        height={height}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 25vw"
        src={src}
        width={width}
      />
    </div>
  );
}

export default async function TenantStorefrontPage({
  params,
}: Readonly<{
  params: Promise<{ tenant: string }>;
}>) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantFromSlug(tenantSlug);
  const products = await client.storefront.listProducts();
  const heroSlides = getHeroSlides(tenant.slug);
  const promoTiles = getPromoTiles(tenant.slug);

  return (
    <>
      <HeroCarousel slides={heroSlides} />

      <PromoTiles tiles={promoTiles} />

      <FeaturedProducts
        products={products}
        tenantSlug={tenant.slug}
        viewAllHref={categoryHref(tenant.slug, [])}
      />

      <section className="bg-background py-16 md:py-32">
        <div className="@container mx-auto max-w-6xl px-6">
          <div>
            <div className="mx-auto max-w-2xl">
              <h2 className="max-w-sm text-balance font-semibold text-4xl text-foreground">
                Tested to standard. Trusted on site.
              </h2>
              <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
                Gloves, head protection, respiratory, and fall arrest — PPE
                tested to international standards for uncompromising work
                environments.
              </p>
            </div>
            <div className="relative mt-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-8 z-0 rounded-full bg-linear-to-br from-amber-400/20 via-orange-400/10 to-yellow-500/20 blur-3xl"
              />
              <div className="relative z-1 grid grid-cols-2 gap-3 md:min-h-124 md:grid-cols-4 md:grid-rows-[repeat(1,minmax(0,11rem))_minmax(0,9rem)]">
                <BentoTile
                  alt="Worker pouring molten metal in Dromex protective smelter gear"
                  className="col-span-2 row-span-2 min-h-64 md:min-h-0"
                  height={768}
                  src="https://cdn-ileilki.nitrocdn.com/EkLsCXqbLRiWPqsCEreFUhtOGppPwkgN/assets/images/optimized/rev-0785b9a/dromex.co.za/wp-content/uploads/2024/10/smelter-j.jpg"
                  width={1152}
                />
                <BentoTile
                  alt="Workers in safety harnesses on an industrial rooftop"
                  className="col-span-2 md:col-span-2"
                  height={372}
                  src="https://cdn-ileilki.nitrocdn.com/EkLsCXqbLRiWPqsCEreFUhtOGppPwkgN/assets/images/optimized/rev-0785b9a/dromex.co.za/wp-content/uploads/2023/10/home-innovation-img-768x372.jpg"
                  width={768}
                />
                <BentoTile
                  alt="Worker wearing durable cargo work pants on a construction site"
                  className="col-span-1"
                  height={768}
                  src="https://cdn-ileilki.nitrocdn.com/EkLsCXqbLRiWPqsCEreFUhtOGppPwkgN/assets/images/optimized/rev-0785b9a/dromex.co.za/wp-content/uploads/2023/10/home-outfit-your-team-img-768x768.jpg"
                  width={768}
                />
                <BentoTile
                  alt="Worker in safety boots and gloves crouching on site"
                  className="col-span-1"
                  height={768}
                  src="https://cdn-ileilki.nitrocdn.com/EkLsCXqbLRiWPqsCEreFUhtOGppPwkgN/assets/images/optimized/rev-0785b9a/dromex.co.za/wp-content/uploads/2023/10/home-block-img-02.jpg"
                  width={768}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SecondaryHero />

      <CustomerStories />

      <AboutSection
        aboutHref={categoryHref(tenant.slug, [])}
        tenantName={tenant.name}
      />
    </>
  );
}
