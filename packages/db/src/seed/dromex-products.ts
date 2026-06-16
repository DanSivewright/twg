import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { and, eq } from "drizzle-orm";

import type { createDb } from "../index";
import {
  media,
  product,
  productCategory,
  productMedia,
  productVariant,
} from "../schema";
import type { DromexProductSeed } from "./data/dromex/product.schema";
import { DROMEX_ORG_ID, resolveCategoryUidBySlugPath } from "./dromex-shared";

const seedDir = dirname(fileURLToPath(import.meta.url));
const productsDir = join(seedDir, "data/dromex/products");

function loadProductSeeds(): DromexProductSeed[] {
  return readdirSync(productsDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const path = join(productsDir, file);
      return JSON.parse(readFileSync(path, "utf8")) as DromexProductSeed;
    });
}

function ancestorSlugPaths(slugPath: string[]) {
  const paths: string[][] = [];

  for (let depth = slugPath.length; depth >= 1; depth--) {
    paths.push(slugPath.slice(0, depth));
  }

  return paths;
}

async function resolveCategoryLinks(
  db: ReturnType<typeof createDb>,
  seed: DromexProductSeed
) {
  const links: Array<{ categoryUid: string; isPrimary: boolean }> = [];
  const seenUids = new Set<string>();
  const primaryPath = seed.primaryCategorySlugPath.join("/");

  for (const slugPath of seed.categorySlugPaths) {
    for (const path of ancestorSlugPaths(slugPath)) {
      const categoryUid = await resolveCategoryUidBySlugPath(
        db,
        DROMEX_ORG_ID,
        path
      );

      if (!categoryUid || seenUids.has(categoryUid)) {
        continue;
      }

      seenUids.add(categoryUid);
      links.push({
        categoryUid,
        isPrimary: slugPath.join("/") === primaryPath,
      });
    }
  }

  const primaryLinks = links.filter((link) => link.isPrimary);
  if (primaryLinks.length === 0 && links[0]) {
    links[0].isPrimary = true;
  } else if (primaryLinks.length > 1) {
    let foundPrimary = false;
    for (const link of links) {
      if (link.isPrimary && !foundPrimary) {
        foundPrimary = true;
        continue;
      }
      link.isPrimary = false;
    }
  }

  return links;
}

export async function seedDromexProducts(db: ReturnType<typeof createDb>) {
  const seeds = loadProductSeeds();
  const results: Array<{
    slug: string;
    productUid: string;
    variantCount: number;
    mediaCount: number;
    categoryLinkCount: number;
  }> = [];

  for (const seed of seeds) {
    const existingProduct = await db
      .select({ uid: product.uid })
      .from(product)
      .where(
        and(
          eq(product.organizationId, DROMEX_ORG_ID),
          eq(product.slug, seed.slug)
        )
      )
      .limit(1);

    let productUid = existingProduct[0]?.uid;

    if (productUid) {
      await db
        .update(product)
        .set({
          title: seed.title,
          productCode: seed.productCode,
          shortDescription: seed.shortDescription,
          description: seed.description,
          datasheetUrl: seed.datasheetUrl,
          sourceUrl: seed.sourceUrl,
          attributes: seed.attributes,
          status: "published",
        })
        .where(eq(product.uid, productUid));
    } else {
      const [created] = await db
        .insert(product)
        .values({
          organizationId: DROMEX_ORG_ID,
          title: seed.title,
          slug: seed.slug,
          productCode: seed.productCode,
          shortDescription: seed.shortDescription,
          description: seed.description,
          datasheetUrl: seed.datasheetUrl,
          sourceUrl: seed.sourceUrl,
          attributes: seed.attributes,
          status: "published",
        })
        .returning({ uid: product.uid });

      productUid = created.uid;
    }

    for (const variant of seed.variants) {
      const existingVariant = await db
        .select({ uid: productVariant.uid })
        .from(productVariant)
        .where(
          and(
            eq(productVariant.productUid, productUid),
            eq(productVariant.sku, variant.sku)
          )
        )
        .limit(1);

      if (existingVariant[0]) {
        await db
          .update(productVariant)
          .set({
            size: variant.size,
            colour: variant.colour,
          })
          .where(eq(productVariant.uid, existingVariant[0].uid));
      } else {
        await db.insert(productVariant).values({
          productUid,
          sku: variant.sku,
          size: variant.size,
          colour: variant.colour,
        });
      }
    }

    const categoryLinks = await resolveCategoryLinks(db, seed);

    for (const link of categoryLinks) {
      const existingLink = await db
        .select({ uid: productCategory.uid })
        .from(productCategory)
        .where(
          and(
            eq(productCategory.productUid, productUid),
            eq(productCategory.categoryUid, link.categoryUid)
          )
        )
        .limit(1);

      if (existingLink[0]) {
        await db
          .update(productCategory)
          .set({ isPrimary: link.isPrimary })
          .where(eq(productCategory.uid, existingLink[0].uid));
      } else {
        await db.insert(productCategory).values({
          productUid,
          categoryUid: link.categoryUid,
          isPrimary: link.isPrimary,
        });
      }
    }

    for (const item of seed.media) {
      const existingMedia = await db
        .select({ uid: media.uid })
        .from(media)
        .where(
          and(eq(media.organizationId, DROMEX_ORG_ID), eq(media.url, item.url))
        )
        .limit(1);

      let mediaUid = existingMedia[0]?.uid;

      if (!mediaUid) {
        const [createdMedia] = await db
          .insert(media)
          .values({
            organizationId: DROMEX_ORG_ID,
            url: item.url,
            fileName: item.fileName,
            altText: item.altText,
            mimeType: item.mimeType ?? "image/jpeg",
            size: 0,
            usage: "product",
          })
          .returning({ uid: media.uid });

        mediaUid = createdMedia.uid;
      }

      const existingProductMedia = await db
        .select({ uid: productMedia.uid })
        .from(productMedia)
        .where(
          and(
            eq(productMedia.productUid, productUid),
            eq(productMedia.mediaUid, mediaUid)
          )
        )
        .limit(1);

      if (!existingProductMedia[0]) {
        await db.insert(productMedia).values({
          productUid,
          mediaUid,
          sortOrder: item.sortOrder,
          isPrimary: item.isPrimary,
        });
      }
    }

    results.push({
      slug: seed.slug,
      productUid,
      variantCount: seed.variants.length,
      mediaCount: seed.media.length,
      categoryLinkCount: categoryLinks.length,
    });
  }

  return {
    organizationId: DROMEX_ORG_ID,
    productCount: results.length,
    products: results,
  };
}
