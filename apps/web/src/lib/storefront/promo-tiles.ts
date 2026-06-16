import type { Route } from "next";

import { categoryHref } from "./paths";

const DROMEX_PROMO_IMAGES = {
  newProducts:
    "https://dromex.co.za/wp-content/uploads/2023/10/home-innovation-img-768x372.jpg",
  outfitTeam:
    "https://dromex.co.za/wp-content/uploads/2023/10/home-outfit-your-team-img-768x768.jpg",
  guide:
    "https://dromex.co.za/wp-content/uploads/2023/10/home-block-img-02.jpg",
} as const;

export function getPromoTiles(tenantSlug: string) {
  return [
    {
      title: "New Products",
      subtitle: "Explore the latest",
      cta: "Explore the Latest",
      imageUrl: DROMEX_PROMO_IMAGES.newProducts,
      imageAlt: "Latest Dromex PPE and workwear products",
      href: categoryHref(tenantSlug, []),
    },
    {
      title: "Outfit Your Team",
      subtitle: "Head-to-toe PPE & workwear",
      cta: "Explore Workwear",
      imageUrl: DROMEX_PROMO_IMAGES.outfitTeam,
      imageAlt: "Team outfitted in Dromex workwear",
      href: categoryHref(tenantSlug, ["workwear"]),
    },
    {
      title: "Workwear & PPE Guide",
      subtitle: "Safety resources",
      cta: "View Guide",
      imageUrl: DROMEX_PROMO_IMAGES.guide,
      imageAlt: "Dromex workwear and PPE safety guide",
      href: categoryHref(tenantSlug, ["ppe"]),
    },
  ] satisfies Array<{
    cta: string;
    href: Route;
    imageAlt: string;
    imageUrl: string;
    subtitle: string;
    title: string;
  }>;
}
