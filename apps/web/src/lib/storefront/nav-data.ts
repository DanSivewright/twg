import type { Route } from "next";

import { getTenantFromSlug } from "@/lib/tenant/server";
import { client } from "@/utils/orpc";

import { categoryHref, productHref } from "./paths";

const PLACEHOLDER_IMAGES = {
  featuredA:
    "https://dromex.co.za/wp-content/uploads/2024/10/protecting-moments-j.jpg",
  featuredB: "https://dromex.co.za/wp-content/uploads/2024/10/arc-glove-j.jpg",
  collection:
    "https://dromex.co.za/wp-content/uploads/2023/10/home-outfit-your-team-img-768x768.jpg",
  ppe: "https://dromex.co.za/wp-content/uploads/2024/10/smelter-j.jpg",
  workwear: "https://dromex.co.za/wp-content/uploads/2026/01/6535-slider.jpg",
  footwear:
    "https://dromex.co.za/wp-content/uploads/2023/10/home-block-img-02.jpg",
} as const;

export interface StoreNavLink {
  href: Route;
  label: string;
}

export interface StoreNavColumn {
  links: StoreNavLink[];
  title: string;
}

export interface NavFeaturedTile {
  href: Route;
  imageUrl: string;
  title: string;
}

export interface CollectionTile {
  href: Route;
  imageUrl: string;
  title: string;
}

export interface NavCategoryMenu {
  childLinks: StoreNavLink[];
  href: Route;
  name: string;
  slug: string;
}

export interface StorefrontNavData {
  categories: NavCategoryMenu[];
  collections: CollectionTile[];
  storeColumns: StoreNavColumn[];
  storeFeatured: NavFeaturedTile[];
  tenantName: string;
  tenantSlug: string;
}

function withPlaceholderImage(
  imageUrl: string | null | undefined,
  fallback: string
): string {
  return imageUrl ?? fallback;
}

export const fallbackStorefrontNavData: StorefrontNavData = {
  tenantSlug: "",
  tenantName: "Dromex",
  categories: [
    {
      name: "PPE",
      slug: "ppe",
      href: "/" as Route,
      childLinks: [
        { label: "Gloves", href: "/" as Route },
        { label: "Head and Face", href: "/" as Route },
        { label: "Respiratory", href: "/" as Route },
        { label: "Fall Arrest", href: "/" as Route },
      ],
    },
    {
      name: "Workwear",
      slug: "workwear",
      href: "/" as Route,
      childLinks: [
        { label: "General", href: "/" as Route },
        { label: "Dromex Arc", href: "/" as Route },
        { label: "Corporate", href: "/" as Route },
      ],
    },
    {
      name: "Footwear",
      slug: "footwear",
      href: "/" as Route,
      childLinks: [
        { label: "Work Boots", href: "/" as Route },
        { label: "Gum Boots", href: "/" as Route },
        { label: "Shoes", href: "/" as Route },
      ],
    },
  ],
  storeColumns: [
    {
      title: "PPE",
      links: [
        { label: "Gloves", href: "/" as Route },
        { label: "Head and Face", href: "/" as Route },
        { label: "Respiratory", href: "/" as Route },
        { label: "Fall Arrest", href: "/" as Route },
      ],
    },
    {
      title: "Workwear",
      links: [
        { label: "General", href: "/" as Route },
        { label: "Dromex Arc", href: "/" as Route },
        { label: "Corporate", href: "/" as Route },
      ],
    },
    {
      title: "Footwear",
      links: [
        { label: "Work Boots", href: "/" as Route },
        { label: "Gum Boots", href: "/" as Route },
        { label: "Shoes", href: "/" as Route },
      ],
    },
  ],
  storeFeatured: [
    {
      title: "Summer Edit",
      href: "/" as Route,
      imageUrl: PLACEHOLDER_IMAGES.featuredA,
    },
    {
      title: "Best Sellers",
      href: "/" as Route,
      imageUrl: PLACEHOLDER_IMAGES.featuredB,
    },
  ],
  collections: [
    {
      title: "Wardrobe Essentials",
      href: "/" as Route,
      imageUrl: PLACEHOLDER_IMAGES.collection,
    },
    {
      title: "Minimal Classics",
      href: "/" as Route,
      imageUrl: PLACEHOLDER_IMAGES.featuredA,
    },
    {
      title: "Modern Workwear",
      href: "/" as Route,
      imageUrl: PLACEHOLDER_IMAGES.featuredB,
    },
    {
      title: "Weekend Wear",
      href: "/" as Route,
      imageUrl: PLACEHOLDER_IMAGES.collection,
    },
  ],
};

export async function getStorefrontNavData(
  tenantSlug: string
): Promise<StorefrontNavData> {
  const tenant = await getTenantFromSlug(tenantSlug);
  const root = await client.storefront.browseCategories({ slugPath: [] });
  const topLevel = root.childCategories;

  if (topLevel.length === 0) {
    return {
      tenantSlug: tenant.slug,
      tenantName: tenant.name,
      categories: fallbackStorefrontNavData.categories.map((item) => ({
        ...item,
        href: categoryHref(tenant.slug, [item.slug]),
        childLinks: item.childLinks.map((link) => ({
          ...link,
          href: categoryHref(tenant.slug, []),
        })),
      })),
      storeColumns: [
        {
          title: "Shop",
          links: [
            {
              label: "All products",
              href: categoryHref(tenant.slug, []),
            },
          ],
        },
      ],
      storeFeatured: fallbackStorefrontNavData.storeFeatured.map((tile) => ({
        ...tile,
        href: categoryHref(tenant.slug, []),
      })),
      collections: fallbackStorefrontNavData.collections.map((tile, index) => ({
        ...tile,
        href: categoryHref(tenant.slug, []),
        title:
          ["All products", "Categories", "New arrivals", "Featured"][index] ??
          tile.title,
      })),
    };
  }

  const categoryDetails = await Promise.all(
    topLevel.map(async (categoryItem) => {
      const result = await client.storefront.browseCategories({
        slugPath: [categoryItem.slug],
      });

      return {
        category: categoryItem,
        children: result.childCategories,
        products: result.products,
      };
    })
  );

  const storeColumns: StoreNavColumn[] = categoryDetails
    .slice(0, 3)
    .map(({ category: categoryItem, children }) => {
      const links =
        children.length > 0
          ? children.map((child) => ({
              label: child.name,
              href: categoryHref(tenant.slug, [categoryItem.slug, child.slug]),
            }))
          : [
              {
                label: `Shop ${categoryItem.name}`,
                href: categoryHref(tenant.slug, [categoryItem.slug]),
              },
            ];

      return {
        title: categoryItem.name,
        links,
      };
    });

  const featuredProducts = root.products
    .filter((item) => item.primaryImageUrl)
    .slice(0, 2);

  const storeFeatured: NavFeaturedTile[] =
    featuredProducts.length > 0
      ? featuredProducts.map((item, index) => ({
          title:
            index === 0
              ? "Featured"
              : item.title.slice(0, 24) || "Best Sellers",
          href: productHref(tenant.slug, item.slug),
          imageUrl: withPlaceholderImage(
            item.primaryImageUrl,
            PLACEHOLDER_IMAGES.featuredA
          ),
        }))
      : fallbackStorefrontNavData.storeFeatured.map((tile, index) => ({
          ...tile,
          href: categoryHref(
            tenant.slug,
            topLevel[index]?.slug ? [topLevel[index].slug] : []
          ),
        }));

  const collections: CollectionTile[] = categoryDetails
    .slice(0, 4)
    .map(({ category: categoryItem, products }, index) => {
      const imageProduct = products.find((item) => item.primaryImageUrl);

      return {
        title: categoryItem.name,
        href: categoryHref(tenant.slug, [categoryItem.slug]),
        imageUrl: withPlaceholderImage(
          imageProduct?.primaryImageUrl,
          [
            PLACEHOLDER_IMAGES.collection,
            PLACEHOLDER_IMAGES.featuredA,
            PLACEHOLDER_IMAGES.featuredB,
            PLACEHOLDER_IMAGES.collection,
          ][index] ?? PLACEHOLDER_IMAGES.collection
        ),
      };
    });

  while (collections.length < 4 && collections.length < topLevel.length) {
    const index = collections.length;
    const categoryItem = topLevel[index];

    if (!categoryItem) {
      break;
    }

    collections.push({
      title: categoryItem.name,
      href: categoryHref(tenant.slug, [categoryItem.slug]),
      imageUrl: PLACEHOLDER_IMAGES.collection,
    });
  }

  const categories: NavCategoryMenu[] = categoryDetails.map(
    ({ category: categoryItem, children }) => ({
      name: categoryItem.name,
      slug: categoryItem.slug,
      href: categoryHref(tenant.slug, [categoryItem.slug]),
      childLinks:
        children.length > 0
          ? children.map((child) => ({
              label: child.name,
              href: categoryHref(tenant.slug, [categoryItem.slug, child.slug]),
            }))
          : [
              {
                label: `Shop ${categoryItem.name}`,
                href: categoryHref(tenant.slug, [categoryItem.slug]),
              },
            ],
    })
  );

  return {
    tenantSlug: tenant.slug,
    tenantName: tenant.name,
    categories,
    storeColumns,
    storeFeatured,
    collections:
      collections.length > 0
        ? collections
        : fallbackStorefrontNavData.collections.map((tile, index) => ({
            ...tile,
            href: categoryHref(
              tenant.slug,
              topLevel[index]?.slug ? [topLevel[index].slug] : []
            ),
          })),
  };
}
