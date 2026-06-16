import { and, eq } from "drizzle-orm";

import type { createDb } from "../index";
import {
  media,
  product,
  productCategory,
  productMedia,
  productVariant,
} from "../schema";
import type { ProductAttributes } from "../schema/commerce/product-attributes";
import { DROMEX_ORG_ID, resolveCategoryUidBySlugPath } from "./dromex-shared";

const CAMO_IMAGE_URL =
  "https://dromex.co.za/wp-content/uploads/2023/11/52J_HR-1-768x1152-1.jpg";

const CAMO_DATASHEET_URL =
  "https://dromex.co.za/wp-content/uploads/2023/11/technical-datasheet-cut5-camo-glove-52j.pdf";

const CAMO_SOURCE_URL = "https://dromex.co.za/product/camo/";

const camoAttributes = {
  composition:
    "100% Dromex Cut5 fibre; Seamless ergonomic liner; Ultra grip PU anti-slip coating; Reinforced thumb crotch; Composite knitted wrist",
  features: [
    "High cut & abrasion resistance",
    "High contact heat protection",
    "High dexterity",
    "Colour UV resistant",
    "Lint free & washable",
    "100% Dromex Cut5 fibre",
    "Seamless ergonomic liner",
    "Ultra grip PU anti-slip coating",
    "Reinforced thumb crotch",
    "Composite knitted wrist",
  ],
  suitableFor: [
    "Military",
    "The Police Force",
    "Outdoor Hunting",
    "Search & Recovery",
    "Mining Extractions Industry",
  ],
  standards: ["EN 388: 4542", "EN 407: X1XXX"],
  colours: ["Orange", "Charcoal", "Olive"],
  sizes: ["8", "9", "10", "11"],
} satisfies ProductAttributes;

const camoVariants = [
  { sku: "52J-8", size: "8", colour: "Orange" },
  { sku: "52J-9", size: "9", colour: "Charcoal" },
  { sku: "52J-10", size: "10", colour: "Olive" },
  { sku: "52J-11", size: "11", colour: null },
] as const;

export async function seedDromexCamo(db: ReturnType<typeof createDb>) {
  const ppeUid = await resolveCategoryUidBySlugPath(db, DROMEX_ORG_ID, ["ppe"]);
  const glovesUid = await resolveCategoryUidBySlugPath(db, DROMEX_ORG_ID, [
    "ppe",
    "gloves",
  ]);
  const cut5Uid = await resolveCategoryUidBySlugPath(db, DROMEX_ORG_ID, [
    "ppe",
    "gloves",
    "cut-5",
  ]);

  if (!(ppeUid && glovesUid && cut5Uid)) {
    throw new Error(
      "Missing PPE category tree. Run seedDromexCategories before seedDromexCamo."
    );
  }

  const existingProduct = await db
    .select({ uid: product.uid })
    .from(product)
    .where(
      and(eq(product.organizationId, DROMEX_ORG_ID), eq(product.slug, "camo"))
    )
    .limit(1);

  let productUid = existingProduct[0]?.uid;

  if (productUid) {
    await db
      .update(product)
      .set({
        title: "Camo",
        productCode: "52J",
        shortDescription:
          "Cut 5 camo glove with high dexterity, contact heat protection, and PU anti-slip coating. Sizes 8–11.",
        description:
          "High cut and abrasion resistant glove made from 100% Dromex Cut5 fibre with seamless ergonomic liner, reinforced thumb crotch, and composite knitted wrist.",
        datasheetUrl: CAMO_DATASHEET_URL,
        sourceUrl: CAMO_SOURCE_URL,
        attributes: camoAttributes,
        status: "published",
      })
      .where(eq(product.uid, productUid));
  } else {
    const [created] = await db
      .insert(product)
      .values({
        organizationId: DROMEX_ORG_ID,
        title: "Camo",
        slug: "camo",
        productCode: "52J",
        shortDescription:
          "Cut 5 camo glove with high dexterity, contact heat protection, and PU anti-slip coating. Sizes 8–11.",
        description:
          "High cut and abrasion resistant glove made from 100% Dromex Cut5 fibre with seamless ergonomic liner, reinforced thumb crotch, and composite knitted wrist.",
        datasheetUrl: CAMO_DATASHEET_URL,
        sourceUrl: CAMO_SOURCE_URL,
        attributes: camoAttributes,
        status: "published",
      })
      .returning({ uid: product.uid });

    productUid = created.uid;
  }

  for (const variant of camoVariants) {
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

  const categoryLinks = [
    { categoryUid: cut5Uid, isPrimary: true },
    { categoryUid: glovesUid, isPrimary: false },
    { categoryUid: ppeUid, isPrimary: false },
  ] as const;

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

  const existingMedia = await db
    .select({ uid: media.uid })
    .from(media)
    .where(
      and(
        eq(media.organizationId, DROMEX_ORG_ID),
        eq(media.url, CAMO_IMAGE_URL)
      )
    )
    .limit(1);

  let mediaUid = existingMedia[0]?.uid;

  if (!mediaUid) {
    const [createdMedia] = await db
      .insert(media)
      .values({
        organizationId: DROMEX_ORG_ID,
        url: CAMO_IMAGE_URL,
        fileName: "52J_HR-1-768x1152-1.jpg",
        altText: "Camo Cut 5 glove",
        mimeType: "image/jpeg",
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
      sortOrder: 0,
      isPrimary: true,
    });
  }

  return {
    organizationId: DROMEX_ORG_ID,
    categories: {
      ppe: ppeUid,
      gloves: glovesUid,
      cut5: cut5Uid,
    },
    productUid,
    mediaUid,
    variantCount: camoVariants.length,
  };
}
