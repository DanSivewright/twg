import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { categoryPageFileName } from "./dromex-category-utils";
import { fetchDromexHtml } from "./dromex-fetch";
import { normalizeDromexUrl } from "./dromex-url";

const seedDir = dirname(fileURLToPath(import.meta.url));

const LOOP_ITEM_REGEX =
  /e-loop-item([\s\S]{0,8000}?)class="product-item-codes-title">([^<]+)</gi;
const PRODUCT_LINK_REGEX =
  /href="(https:\/\/dromex\.co\.za\/product\/[^"#]+)"/i;
const PAGE_LINK_REGEX = /product-category\/[^"']+\/page\/(\d+)/gi;

export interface CategoryPageProductListing {
  productCode: string;
  slug: string;
  sourceUrl: string;
  title: string;
}

export interface CategoryPageSeed {
  categorySlugPath: string[];
  products: CategoryPageProductListing[];
  scrapedAt: string;
  sourceUrl: string;
}

function parseCategoryPageProducts(html: string) {
  const products: CategoryPageProductListing[] = [];
  const seenSlugs = new Set<string>();

  for (const match of html.matchAll(LOOP_ITEM_REGEX)) {
    const block = match[1] ?? "";
    const productCode = match[2]?.trim() ?? "";
    const linkMatch = block.match(PRODUCT_LINK_REGEX);
    const sourceUrl = linkMatch?.[1] ? normalizeDromexUrl(linkMatch[1]) : null;

    if (!sourceUrl) {
      continue;
    }

    const slug = sourceUrl.split("/").filter(Boolean).at(-1) ?? "";
    if (!slug || seenSlugs.has(slug)) {
      continue;
    }

    seenSlugs.add(slug);
    products.push({
      slug,
      title: slug
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      productCode,
      sourceUrl,
    });
  }

  return products;
}

function parseMaxPageNumber(html: string, categoryPath: string) {
  const escapedPath = categoryPath.replaceAll("/", "\\/");
  const pageRegex = new RegExp(`${escapedPath}/page/(\\d+)`, "gi");
  const pages = [...html.matchAll(pageRegex)].map((match) => Number(match[1]));

  return pages.length > 0 ? Math.max(...pages) : 1;
}

async function fetchCategoryPageHtml(sourceUrl: string) {
  const normalizedSourceUrl = normalizeDromexUrl(sourceUrl);
  return fetchDromexHtml(normalizedSourceUrl);
}

export async function scrapeDromexCategoryPage(input: {
  categorySlugPath: string[];
  sourceUrl: string;
}): Promise<CategoryPageSeed> {
  const normalizedSourceUrl = normalizeDromexUrl(input.sourceUrl);
  const firstPageHtml = await fetchCategoryPageHtml(normalizedSourceUrl);
  const categoryPath = new URL(normalizedSourceUrl).pathname.replace(/\/$/, "");
  const maxPage = parseMaxPageNumber(firstPageHtml, categoryPath);

  const products = parseCategoryPageProducts(firstPageHtml);
  const seenSlugs = new Set(products.map((product) => product.slug));

  for (let page = 2; page <= maxPage; page++) {
    const pageUrl = `${normalizedSourceUrl.replace(/\/$/, "")}/page/${page}/`;
    const pageHtml = await fetchCategoryPageHtml(pageUrl);
    const pageProducts = parseCategoryPageProducts(pageHtml);

    for (const product of pageProducts) {
      if (seenSlugs.has(product.slug)) {
        continue;
      }

      seenSlugs.add(product.slug);
      products.push(product);
    }
  }

  return {
    categorySlugPath: input.categorySlugPath,
    sourceUrl: normalizedSourceUrl,
    scrapedAt: new Date().toISOString().slice(0, 10),
    products,
  };
}

export async function scrapeAndWriteCategoryPage(input: {
  categorySlugPath: string[];
  sourceUrl: string;
}) {
  const categoryPage = await scrapeDromexCategoryPage(input);
  const outputPath = join(
    seedDir,
    "data/dromex/category-pages",
    categoryPageFileName(input.categorySlugPath)
  );
  writeFileSync(outputPath, `${JSON.stringify(categoryPage, null, 2)}\n`);

  return { outputPath, categoryPage };
}
