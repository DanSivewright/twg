"use client";

import {
  ArrowDown01Icon,
  Menu01Icon,
  Search01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@twg/ui/components/accordion";
import { Badge } from "@twg/ui/components/badge";
import { Button } from "@twg/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@twg/ui/components/sheet";
import { cn } from "@twg/ui/lib/utils";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { StorefrontNavData } from "@/lib/storefront/nav-data";
import { categoryHref, tenantHomeHref } from "@/lib/storefront/paths";

const navTriggerClassName =
  "inline-flex h-9 items-center gap-1 rounded-full px-4 font-medium text-foreground/80 text-xs uppercase tracking-wider transition-colors hover:bg-muted hover:text-foreground";

function NavTrigger({
  label,
  isActive,
  onOpen,
  className,
}: {
  label: string;
  isActive: boolean;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      className={cn(
        navTriggerClassName,
        isActive && "bg-muted text-foreground",
        className
      )}
      onClick={onOpen}
      onMouseEnter={onOpen}
      type="button"
    >
      {label}
      <HugeiconsIcon
        className={cn(
          "size-3 transition duration-300",
          isActive && "rotate-180"
        )}
        icon={ArrowDown01Icon}
        strokeWidth={2}
      />
    </button>
  );
}

function CategoryPanel({
  data,
  activeSlug,
}: {
  data: StorefrontNavData;
  activeSlug: string;
}) {
  const category = data.categories.find((item) => item.slug === activeSlug);

  if (!category) {
    return null;
  }

  return (
    <div className="w-full animate-[navbar-fade-in-slide-down_0.35s_cubic-bezier(0.33,1,0.68,1)_forwards] px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-4 font-semibold text-foreground text-xs uppercase tracking-wider">
              {category.name}
            </p>
            <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {category.childLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className="font-medium text-[#fec900] text-sm hover:underline"
                  href={category.href}
                >
                  View all {category.name}
                </Link>
              </li>
            </ul>
          </div>

          {data.storeFeatured.length > 0 ? (
            <div className="hidden gap-4 lg:flex">
              {data.storeFeatured.slice(0, 2).map((tile) => (
                <Link
                  className="group flex w-40 flex-col gap-2"
                  href={tile.href}
                  key={tile.title}
                >
                  <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-muted">
                    <Image
                      alt={tile.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      fill
                      sizes="160px"
                      src={tile.imageUrl}
                      unoptimized
                    />
                  </div>
                  <p className="font-medium text-foreground text-xs uppercase tracking-wider">
                    {tile.title}
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function UtilityActions() {
  return (
    <div className="flex items-center gap-1">
      <Button
        className="hidden font-normal text-foreground/80 text-xs uppercase tracking-wider lg:inline-flex"
        nativeButton={false}
        render={<Link href={"/contact" as Route}>Contact Us</Link>}
        variant="ghost"
      />

      <Button
        aria-label="Shopping bag"
        className="relative"
        size="icon-lg"
        type="button"
        variant="ghost"
      >
        <HugeiconsIcon icon={ShoppingBag01Icon} strokeWidth={2} />
        <Badge className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-[10px]">
          0
        </Badge>
      </Button>

      <Button aria-label="Search" size="icon-lg" type="button" variant="ghost">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
      </Button>
    </div>
  );
}

function MobileNav({ data }: { data: StorefrontNavData }) {
  const allProductsHref = categoryHref(data.tenantSlug, []);

  return (
    <Accordion className="w-full" multiple>
      {data.categories.map((category) => (
        <AccordionItem key={category.slug} value={category.slug}>
          <AccordionTrigger>{category.name}</AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2">
              {category.childLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    className="text-muted-foreground text-sm"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  className="font-medium text-[#fec900] text-sm"
                  href={category.href}
                >
                  View all {category.name}
                </Link>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}

      <div className="flex flex-col gap-2 border-b py-2.5">
        <Link
          className="font-medium text-sm uppercase tracking-wide"
          href={allProductsHref}
        >
          All products
        </Link>
        <span className="font-medium text-sm uppercase tracking-wide">
          Find a store
        </span>
      </div>
    </Accordion>
  );
}

export function StorefrontNavbar({ data }: { data: StorefrontNavData }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const homeHref = data.tenantSlug
    ? tenantHomeHref(data.tenantSlug)
    : ("/" as Route);
  const allProductsHref = categoryHref(data.tenantSlug, []);

  return (
    <section className="pointer-events-auto sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <nav
        aria-label="Storefront"
        className="relative flex min-h-16 w-full items-center"
        onPointerLeave={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setActiveCategory(null);
          }
        }}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 lg:px-6">
          <Link
            className="flex min-w-0 items-center gap-2 font-bold text-base tracking-tight"
            href={homeHref}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#fec900] font-bold text-black text-xs">
              {data.tenantName.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{data.tenantName}</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {data.categories.map((category) => (
              <NavTrigger
                isActive={activeCategory === category.slug}
                key={category.slug}
                label={category.name}
                onOpen={() => setActiveCategory(category.slug)}
              />
            ))}
            <Link className={navTriggerClassName} href={allProductsHref}>
              All products
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <div className="hidden lg:flex">
              <UtilityActions />
            </div>

            <Sheet>
              <SheetTrigger
                className="lg:hidden"
                render={<Button size="icon-lg" variant="ghost" />}
              >
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
                <span className="sr-only">Open menu</span>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto" side="right">
                <SheetHeader>
                  <SheetTitle>{data.tenantName}</SheetTitle>
                </SheetHeader>
                <MobileNav data={data} />
                <div className="px-4 pb-4">
                  <UtilityActions />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {activeCategory ? (
          <section
            aria-label={`${activeCategory} menu`}
            className="absolute top-full left-0 hidden w-full border-t bg-background shadow-sm lg:block"
            onPointerEnter={() => setActiveCategory(activeCategory)}
          >
            <CategoryPanel activeSlug={activeCategory} data={data} />
          </section>
        ) : null}
      </nav>
    </section>
  );
}
