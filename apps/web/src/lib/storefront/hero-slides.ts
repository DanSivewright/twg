import type { Route } from "next";

import { categoryHref } from "./paths";

export interface HeroSlide {
  ctas: Array<{
    href: Route | string;
    label: string;
  }>;
  description: string;
  id: string;
  imageAlt: string;
  imageUrl: string;
  title: string;
}

export function getHeroSlides(tenantSlug: string): HeroSlide[] {
  return heroSlides.map((slide) => ({
    ...slide,
    ctas: slide.ctas.map((cta) => {
      if (cta.href.startsWith("http")) {
        return cta;
      }

      const slugPath = cta.href.split("/").filter(Boolean);
      return {
        ...cta,
        href: categoryHref(tenantSlug, slugPath),
      };
    }),
  }));
}

export const heroSlides: HeroSlide[] = [
  {
    id: "protecting-moments",
    title: "Protecting moments",
    description: "Dromex, Workwear & PPE. Helping to bring you home safely.",
    imageUrl:
      "https://dromex.co.za/wp-content/uploads/2024/10/protecting-moments-j.jpg",
    imageAlt: "Dromex workwear protecting workers on site",
    ctas: [
      { label: "Explore Workwear", href: "workwear" },
      { label: "Watch Advert", href: "https://www.youtube.com/user/DromexPPE" },
    ],
  },
  {
    id: "beyond-the-ordinary",
    title: "Beyond the Ordinary",
    description:
      "At Dromex we honour the brave, hard-working men and women who work beyond the ordinary to provide for their families. We understand that they work in tough and uncompromising environments and so our products are designed and tested to the highest international standards.",
    imageUrl: "https://dromex.co.za/wp-content/uploads/2024/10/smelter-j.jpg",
    imageAlt: "Worker in industrial smelter environment wearing Dromex PPE",
    ctas: [
      { label: "About Us", href: "ppe" },
      {
        label: "Watch Full Advert",
        href: "https://www.youtube.com/user/DromexPPE",
      },
    ],
  },
  {
    id: "arc-flash-protection",
    title: "ARC Flash Protection",
    description:
      "The Dromex ARC Flash protection range has been scientifically designed and tested to ensure it complies with the highest international standards and provides lifesaving protection in these hazardous environments.",
    imageUrl: "https://dromex.co.za/wp-content/uploads/2024/10/arc-glove-j.jpg",
    imageAlt: "Dromex ARC flash protection gloves",
    ctas: [{ label: "ARC Range", href: "ppe" }],
  },
  {
    id: "dh-302-respiratory",
    title: "New Benchmark in respiratory",
    description:
      "The DH-302 Respiratory Range with its soft, comfortable Thermoplastic Rubber/Elastomer (TPR) face piece, low profile design, four-point adjustment system and high quality straps ensure a secure face seal and long lasting comfort for those who work beyond the ordinary.",
    imageUrl:
      "https://dromex.co.za/wp-content/uploads/2025/01/dh-302-slider_lrg.jpg",
    imageAlt: "Dromex DH-302 respiratory protection range",
    ctas: [
      { label: "Product information", href: "ppe/respiratory/reusable-masks" },
      { label: "Watch advert", href: "https://www.youtube.com/user/DromexPPE" },
    ],
  },
  {
    id: "evotech-range",
    title: "New Evotech range",
    description:
      "Unforgiving environments demand uncompromising workwear. Dromex Evotech workwear has been developed using advanced technology to provide protection and comfort in the harshest environments. Constructed from lightweight, breathable fabrics. Built in UPF 50 protection. Colour fast materials to keep your garments brighter and visible for longer.",
    imageUrl: "https://dromex.co.za/wp-content/uploads/2026/01/6535-slider.jpg",
    imageAlt: "Dromex Evotech workwear range",
    ctas: [{ label: "Explore Workwear", href: "workwear" }],
  },
];
