"use client";

import { Button } from "@twg/ui/components/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@twg/ui/components/carousel";
import { cn } from "@twg/ui/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/storefront/hero-slides";

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) {
      return;
    }
    setSelectedIndex(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  return (
    <section
      aria-label="Featured highlights"
      className="relative flex w-screen flex-col gap-6 py-8"
      // className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] flex w-screen max-w-[100vw] flex-col gap-6 px-4 pb-8 lg:min-h-[862px] lg:pb-16"
    >
      <Carousel
        className="w-full"
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 6000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
        setApi={setApi}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem
              className="basis-[88%] sm:basis-[82%] md:basis-[78%] lg:basis-[72%]"
              key={slide.id}
            >
              <article
                className={cn(
                  "relative h-[min(72vh,640px)] overflow-hidden rounded-2xl transition-opacity duration-500 lg:h-[min(78vh,760px)]",
                  selectedIndex === index ? "opacity-100" : "opacity-70"
                )}
              >
                <Image
                  alt={slide.imageAlt}
                  className="object-cover object-center"
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 88vw, 72vw"
                  src={slide.imageUrl}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 top-1/2 bg-linear-to-t from-black to-transparent"
                />

                <div className="absolute inset-x-0 bottom-0">
                  <div
                    className={cn(
                      "flex flex-col gap-5 p-10",
                      selectedIndex === index ? "opacity-100" : "opacity-80"
                    )}
                  >
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <h2 className="text-pretty font-semibold text-2xl text-white uppercase tracking-wide sm:text-3xl lg:text-4xl">
                        {slide.title}
                      </h2>
                      <p className="max-w-xl text-sm text-white/90 leading-relaxed sm:text-base">
                        {slide.description}
                      </p>
                    </div>
                    {slide.ctas.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {slide.ctas.map((cta) => {
                          const isExternal = cta.href.startsWith("http");

                          if (isExternal) {
                            return (
                              <a
                                className="inline-flex h-10 items-center justify-center rounded-full bg-[#fec900] px-5 font-medium text-black text-sm hover:bg-[#fec900]/80"
                                href={cta.href}
                                key={cta.label}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {cta.label}
                              </a>
                            );
                          }

                          return (
                            <Button
                              className="h-10 rounded-full bg-[#fec900] px-5 text-black hover:bg-[#fec900]/80"
                              key={cta.label}
                              nativeButton={false}
                              render={<Link href={cta.href as Route} />}
                              size="sm"
                            >
                              {cta.label}
                            </Button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div
        aria-label="Slide navigation"
        className="flex justify-center gap-2"
        role="tablist"
      >
        {slides.map((slide, index) => (
          <button
            aria-label={`Go to slide ${index + 1}: ${slide.title}`}
            aria-selected={selectedIndex === index}
            className={cn(
              "size-2.5 rounded-full transition-colors",
              selectedIndex === index
                ? "bg-foreground"
                : "bg-foreground/25 hover:bg-foreground/45"
            )}
            key={slide.id}
            onClick={() => api?.scrollTo(index)}
            role="tab"
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
