import { ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@twg/ui/components/button";
import Link from "next/link";

import { categoryHref } from "@/lib/storefront/paths";

interface HeroProps {
  tenantSlug: string;
}

const Hero = ({ tenantSlug }: HeroProps) => (
  <section className="relative">
    <div className="relative">
      <div className="relative z-10 flex aspect-2/3 flex-col justify-end px-6 lg:aspect-video">
        <div className="mx-auto w-full max-w-7xl pb-6 lg:px-12 lg:pb-32">
          <div className="max-w-xl">
            <h1 className="text-balance text-5xl text-white md:text-6xl xl:text-7xl">
              Dromex Workwear &amp; PPE
            </h1>
            <p className="mt-6 text-balance text-lg text-white/90">
              Unforgiving environments demand uncompromising workwear. Our
              products are designed to help bring you home safely.
            </p>

            <div className="mt-8 flex items-center gap-2">
              <Button
                className="h-12 rounded-full bg-[#fec900] pr-3 pl-5 text-black hover:bg-[#fec900]/80"
                nativeButton={false}
                render={<Link href={categoryHref(tenantSlug, ["ppe"])} />}
                size="lg"
              >
                <span className="text-nowrap">Explore PPE</span>
                <HugeiconsIcon icon={ChevronRightIcon} />
              </Button>
              <Button
                className="h-12 rounded-full px-5 text-base text-white hover:bg-[#fec900]/20 hover:text-white"
                nativeButton={false}
                render={<Link href={categoryHref(tenantSlug, ["workwear"])} />}
                size="lg"
                variant="ghost"
              >
                <span className="text-nowrap">Explore Workwear</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-1 aspect-2/3 overflow-hidden rounded-3xl border border-black/10 lg:aspect-video lg:rounded-[3rem] dark:border-white/5">
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
export default Hero;
