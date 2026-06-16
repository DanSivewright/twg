import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

interface PromoTile {
  cta: string;
  href: Route;
  imageAlt: string;
  imageUrl: string;
  subtitle: string;
  title: string;
}

interface PromoTilesProps {
  tiles: PromoTile[];
}

export function PromoTiles({ tiles }: PromoTilesProps) {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-2xl"
            href={tile.href}
            key={tile.title}
          >
            <Image
              alt={tile.imageAlt}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              src={tile.imageUrl}
              unoptimized
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"
            />
            <div className="relative z-10 p-6 text-white">
              <p className="text-white/80 text-xs uppercase tracking-wider">
                {tile.subtitle}
              </p>
              <h3 className="mt-1 font-semibold text-xl">{tile.title}</h3>
              <span className="mt-3 inline-block font-medium text-[#fec900] text-sm underline-offset-4 group-hover:underline">
                {tile.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
