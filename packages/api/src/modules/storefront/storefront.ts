import { category } from "@twg/db/schema/commerce/category";
import {
  productCategory,
  productMedia,
} from "@twg/db/schema/commerce/junctions";
import { product } from "@twg/db/schema/commerce/product";
import type { ProductAttributes } from "@twg/db/schema/commerce/product-attributes";
import { productVariant } from "@twg/db/schema/commerce/product-variant";
import { media } from "@twg/db/schema/media";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";

import { createDb } from "../../lib/db";

export interface CategoryRef {
  name: string;
  slug: string;
  uid: string;
}

export interface ProductListItem {
  primaryImageUrl: string | null;
  productCode: string | null;
  slug: string;
  title: string;
  uid: string;
}

export interface CategoryBrowseResult {
  breadcrumb: CategoryRef[];
  category: CategoryRef | null;
  childCategories: CategoryRef[];
  products: ProductListItem[];
}

export interface ProductCategoryRef extends CategoryRef {
  isPrimary: boolean;
  slugPath: string[];
}

export interface ProductVariantRef {
  colour: string | null;
  size: string | null;
  sku: string;
  uid: string;
}

export interface ProductMediaRef {
  altText: string | null;
  isPrimary: boolean;
  uid: string;
  url: string;
}

export interface ProductDetail {
  attributes: ProductAttributes | null;
  categories: ProductCategoryRef[];
  datasheetUrl: string | null;
  description: string | null;
  media: ProductMediaRef[];
  productCode: string | null;
  shortDescription: string | null;
  slug: string;
  sourceUrl: string | null;
  title: string;
  uid: string;
  variants: ProductVariantRef[];
}

interface CategoryRow {
  name: string;
  parentCategoryUid: string | null;
  slug: string;
  sortOrder: number;
  uid: string;
}

function toCategoryRef(row: {
  uid: string;
  name: string;
  slug: string;
}): CategoryRef {
  return {
    uid: row.uid,
    name: row.name,
    slug: row.slug,
  };
}

function listOrganizationCategories(organizationId: string) {
  const db = createDb();

  return db
    .select({
      uid: category.uid,
      name: category.name,
      slug: category.slug,
      parentCategoryUid: category.parentCategoryUid,
      sortOrder: category.sortOrder,
    })
    .from(category)
    .where(eq(category.organizationId, organizationId))
    .orderBy(asc(category.sortOrder), asc(category.name));
}

function buildSlugPathMap(categories: CategoryRow[]): Map<string, string[]> {
  const byUid = new Map(categories.map((row) => [row.uid, row]));
  const cache = new Map<string, string[]>();

  function getPath(uid: string): string[] {
    const cached = cache.get(uid);
    if (cached) {
      return cached;
    }

    const row = byUid.get(uid);
    if (!row) {
      return [];
    }

    const path = row.parentCategoryUid
      ? [...getPath(row.parentCategoryUid), row.slug]
      : [row.slug];

    cache.set(uid, path);
    return path;
  }

  for (const row of categories) {
    getPath(row.uid);
  }

  return cache;
}

function getDescendantCategoryUids(
  categories: CategoryRow[],
  rootUid: string
): string[] {
  const childrenByParent = new Map<string, string[]>();

  for (const row of categories) {
    if (!row.parentCategoryUid) {
      continue;
    }

    const siblings = childrenByParent.get(row.parentCategoryUid) ?? [];
    siblings.push(row.uid);
    childrenByParent.set(row.parentCategoryUid, siblings);
  }

  const result = [rootUid];
  const queue = [rootUid];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    const children = childrenByParent.get(current) ?? [];
    for (const childUid of children) {
      result.push(childUid);
      queue.push(childUid);
    }
  }

  return result;
}

async function attachPrimaryImages(
  items: Omit<ProductListItem, "primaryImageUrl">[]
): Promise<ProductListItem[]> {
  if (items.length === 0) {
    return [];
  }

  const db = createDb();
  const productUids = items.map((item) => item.uid);

  const imageRows = await db
    .select({
      productUid: productMedia.productUid,
      url: media.url,
    })
    .from(productMedia)
    .innerJoin(media, eq(media.uid, productMedia.mediaUid))
    .where(
      and(
        inArray(productMedia.productUid, productUids),
        eq(productMedia.isPrimary, true)
      )
    );

  const imageByProduct = new Map(
    imageRows.map((row) => [row.productUid, row.url])
  );

  return items.map((item) => ({
    ...item,
    primaryImageUrl: imageByProduct.get(item.uid) ?? null,
  }));
}

export async function resolveCategoryBySlugPath(
  organizationId: string,
  slugPath: string[]
): Promise<{ category: CategoryRef | null; breadcrumb: CategoryRef[] }> {
  if (slugPath.length === 0) {
    return { category: null, breadcrumb: [] };
  }

  const db = createDb();
  const breadcrumb: CategoryRef[] = [];
  let parentUid: string | null = null;

  for (const slug of slugPath) {
    const [row] = await db
      .select({
        uid: category.uid,
        name: category.name,
        slug: category.slug,
        parentCategoryUid: category.parentCategoryUid,
      })
      .from(category)
      .where(
        and(
          eq(category.organizationId, organizationId),
          eq(category.slug, slug),
          parentUid === null
            ? isNull(category.parentCategoryUid)
            : eq(category.parentCategoryUid, parentUid)
        )
      )
      .limit(1);

    if (!row) {
      return { category: null, breadcrumb };
    }

    breadcrumb.push(toCategoryRef(row));
    parentUid = row.uid;
  }

  return {
    category: breadcrumb.at(-1) ?? null,
    breadcrumb,
  };
}

async function listPublishedProductsForCategories(
  organizationId: string,
  categoryUids: string[] | null
): Promise<Omit<ProductListItem, "primaryImageUrl">[]> {
  const db = createDb();

  if (!categoryUids || categoryUids.length === 0) {
    return db
      .select({
        uid: product.uid,
        title: product.title,
        slug: product.slug,
        productCode: product.productCode,
      })
      .from(product)
      .where(
        and(
          eq(product.organizationId, organizationId),
          eq(product.status, "published")
        )
      )
      .orderBy(asc(product.title));
  }

  const rows = await db
    .selectDistinct({
      uid: product.uid,
      title: product.title,
      slug: product.slug,
      productCode: product.productCode,
    })
    .from(product)
    .innerJoin(productCategory, eq(productCategory.productUid, product.uid))
    .where(
      and(
        eq(product.organizationId, organizationId),
        eq(product.status, "published"),
        inArray(productCategory.categoryUid, categoryUids)
      )
    )
    .orderBy(asc(product.title));

  return rows;
}

export async function browseCategoriesBySlugPath(
  organizationId: string,
  slugPath: string[]
): Promise<CategoryBrowseResult | null> {
  const allCategories = await listOrganizationCategories(organizationId);
  const resolved = await resolveCategoryBySlugPath(organizationId, slugPath);

  if (slugPath.length > 0 && !resolved.category) {
    return null;
  }

  const parentUid = resolved.category?.uid ?? null;
  const childCategories = allCategories
    .filter((row) => row.parentCategoryUid === parentUid)
    .map(toCategoryRef);

  let categoryUids: string[] | null = null;

  if (resolved.category) {
    categoryUids = getDescendantCategoryUids(
      allCategories,
      resolved.category.uid
    );
  }

  const products = await listPublishedProductsForCategories(
    organizationId,
    categoryUids
  );

  return {
    category: resolved.category,
    breadcrumb: resolved.breadcrumb,
    childCategories,
    products: await attachPrimaryImages(products),
  };
}

export async function listPublishedProducts(organizationId: string) {
  const result = await browseCategoriesBySlugPath(organizationId, []);

  return result?.products ?? [];
}

export async function getPublishedProductBySlug(
  organizationId: string,
  slug: string
): Promise<ProductDetail | null> {
  const db = createDb();

  const [productRow] = await db
    .select({
      uid: product.uid,
      title: product.title,
      slug: product.slug,
      productCode: product.productCode,
      shortDescription: product.shortDescription,
      description: product.description,
      datasheetUrl: product.datasheetUrl,
      sourceUrl: product.sourceUrl,
      attributes: product.attributes,
    })
    .from(product)
    .where(
      and(
        eq(product.organizationId, organizationId),
        eq(product.slug, slug),
        eq(product.status, "published")
      )
    )
    .limit(1);

  if (!productRow) {
    return null;
  }

  const [variants, categoryLinks, mediaLinks, allCategories] =
    await Promise.all([
      db
        .select({
          uid: productVariant.uid,
          sku: productVariant.sku,
          size: productVariant.size,
          colour: productVariant.colour,
        })
        .from(productVariant)
        .where(eq(productVariant.productUid, productRow.uid))
        .orderBy(asc(productVariant.sku)),
      db
        .select({
          uid: category.uid,
          name: category.name,
          slug: category.slug,
          isPrimary: productCategory.isPrimary,
        })
        .from(productCategory)
        .innerJoin(category, eq(category.uid, productCategory.categoryUid))
        .where(eq(productCategory.productUid, productRow.uid)),
      db
        .select({
          uid: media.uid,
          url: media.url,
          altText: media.altText,
          isPrimary: productMedia.isPrimary,
          sortOrder: productMedia.sortOrder,
        })
        .from(productMedia)
        .innerJoin(media, eq(media.uid, productMedia.mediaUid))
        .where(eq(productMedia.productUid, productRow.uid))
        .orderBy(asc(productMedia.sortOrder)),
      listOrganizationCategories(organizationId),
    ]);

  const slugPathByCategory = buildSlugPathMap(allCategories);

  const categories: ProductCategoryRef[] = categoryLinks.map((link) => ({
    uid: link.uid,
    name: link.name,
    slug: link.slug,
    slugPath: slugPathByCategory.get(link.uid) ?? [link.slug],
    isPrimary: link.isPrimary,
  }));

  categories.sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) {
      return a.isPrimary ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

  return {
    uid: productRow.uid,
    title: productRow.title,
    slug: productRow.slug,
    productCode: productRow.productCode,
    shortDescription: productRow.shortDescription,
    description: productRow.description,
    datasheetUrl: productRow.datasheetUrl,
    sourceUrl: productRow.sourceUrl,
    attributes: productRow.attributes as ProductAttributes | null,
    variants,
    categories,
    media: mediaLinks.map((link) => ({
      uid: link.uid,
      url: link.url,
      altText: link.altText,
      isPrimary: link.isPrimary,
    })),
  };
}
