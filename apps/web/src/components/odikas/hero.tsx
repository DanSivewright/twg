import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@twg/ui/components/button";
import Link from "next/link";

import {
  odikasTagline,
  odikasTaglineEn,
} from "@/lib/storefront/odikas/offerings";
import { offeringHref } from "@/lib/storefront/paths";

interface OdikasHeroProps {
  tenantSlug: string;
}

export function OdikasHero({ tenantSlug }: OdikasHeroProps) {
  return (
    <section className="relative p-2">
      <div className="relative">
        <div className="relative z-10 flex aspect-2/3 flex-col justify-end px-6 lg:aspect-video">
          <div className="mx-auto w-full max-w-7xl pb-6 lg:px-12 lg:pb-32">
            <div className="max-w-2xl">
              <p className="font-medium text-[#fec900] text-sm uppercase tracking-widest">
                ODIKAS SARL
              </p>
              <h1 className="mt-4 text-balance text-5xl text-white md:text-6xl xl:text-7xl">
                Industrial supply &amp; services for the DRC
              </h1>
              <p className="mt-2 text-balance text-white/80 text-xl italic md:text-2xl">
                {odikasTagline}
              </p>
              <p className="mt-4 text-balance text-lg text-white/90">
                {odikasTaglineEn}. ODIKAS is a major B2B partner for mining and
                construction operators — equipping sites, protecting crews, and
                delivering performance across the Democratic Republic of Congo.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <Button
                  className="h-12 rounded-full bg-[#fec900] pr-3 pl-5 text-black hover:bg-[#fec900]/80"
                  nativeButton={false}
                  render={<Link href={offeringHref(tenantSlug, "ppe")} />}
                  size="lg"
                >
                  <span className="text-nowrap">Explore PPE</span>
                  <HugeiconsIcon icon={ChevronRightIcon} />
                </Button>
                <Button
                  className="h-12 rounded-full px-5 text-base text-white hover:bg-[#fec900]/20 hover:text-white"
                  nativeButton={false}
                  render={
                    <Link href={offeringHref(tenantSlug, "site-equipment")} />
                  }
                  size="lg"
                  variant="ghost"
                >
                  <span className="text-nowrap">Our services</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 aspect-2/3 overflow-hidden rounded-2xl border border-black/10 lg:aspect-video dark:border-white/5">
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-transparent" />
          <video
            autoPlay
            className="size-full object-cover"
            loop
            muted
            playsInline
            src="/hero-video.mp4"
          />
        </div>
      </div>
    </section>
  );
}
