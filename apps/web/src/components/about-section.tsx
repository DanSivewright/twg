import type { Route } from "next";
import Link from "next/link";

interface AboutSectionProps {
  aboutHref?: Route;
  tenantName: string;
}

export function AboutSection({ tenantName, aboutHref }: AboutSectionProps) {
  return (
    <section className="bg-foreground py-16 text-background md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2">
        <div>
          <p className="font-medium text-[#fec900] text-sm uppercase tracking-widest">
            About {tenantName}
          </p>
          <h2 className="mt-4 text-balance font-semibold text-3xl md:text-4xl">
            Africa&apos;s leading manufacturer and distributor of workwear &amp;
            PPE
          </h2>
        </div>
        <div className="space-y-4 text-background/80 leading-relaxed">
          <p>
            {tenantName} was originally founded in 1998, operating from a
            750m&sup2; warehouse, supplying marine based products to ship
            chandlers. From this humble beginning, {tenantName} has grown into
            Africa&apos;s leading manufacturer and distributor of work wear and
            personal protective equipment.
          </p>
          <p>
            We are active members of various SABS technical committees, with the
            brand becoming synonymous with quality, competitive pricing, and
            on-time delivery.
          </p>
          {aboutHref ? (
            <Link
              className="inline-block font-medium text-[#fec900] text-sm underline-offset-4 hover:underline"
              href={aboutHref}
            >
              About {tenantName}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
