import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DromexProductSeed } from "./data/dromex/product.schema";
import {
  categoryPageFileName,
  collectAllCategoryLeaves,
} from "./dromex-category-utils";
import { scrapeAndWriteCategoryPage } from "./scrape-dromex-category-page";
import { scrapeDromexProduct } from "./scrape-dromex-product";

const seedDir = dirname(fileURLToPath(import.meta.url));
const manifestPath = join(seedDir, "data/dromex/crawl-manifest.json");
const productsDir = join(seedDir, "data/dromex/products");
const categoryPagesDir = join(seedDir, "data/dromex/category-pages");

interface CrawlManifest {
  categories: { status: string; completedAt: string };
  categoryPages: Record<
    string,
    {
      status: string;
      categorySlugPath: string[];
      productCount: number;
      completedAt: string;
    }
  >;
  notes: string;
  products: Record<
    string,
    {
      status: string;
      sourceUrl: string;
      completedAt: string;
      categorySlugPaths?: string[][];
    }
  >;
  source: string;
  startedAt: string;
  updatedAt: string | null;
  version: number;
}

function loadManifest(): CrawlManifest {
  return JSON.parse(readFileSync(manifestPath, "utf8")) as CrawlManifest;
}

function saveManifest(manifest: CrawlManifest) {
  manifest.updatedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function slugPathsEqual(a: string[], b: string[]) {
  return (
    a.length === b.length && a.every((segment, index) => segment === b[index])
  );
}

function mergeCategorySlugPaths(
  existing: string[][],
  incoming: string[][]
): string[][] {
  const merged = [...existing];

  for (const path of incoming) {
    if (!merged.some((item) => slugPathsEqual(item, path))) {
      merged.push(path);
    }
  }

  return merged;
}

function loadExistingProduct(slug: string): DromexProductSeed | null {
  const path = join(productsDir, `${slug}.json`);
  if (!existsSync(path)) {
    return null;
  }

  return JSON.parse(readFileSync(path, "utf8")) as DromexProductSeed;
}

function writeProduct(product: DromexProductSeed) {
  const outputPath = join(productsDir, `${product.slug}.json`);
  writeFileSync(outputPath, `${JSON.stringify(product, null, 2)}\n`);
  return outputPath;
}

const forceRescrape = process.argv.includes("--force");

const manifest = loadManifest();
const leaves = collectAllCategoryLeaves();

console.log(`Crawling ${leaves.length} leaf categories…`);

for (const leaf of leaves) {
  const categoryPagePath = join(
    categoryPagesDir,
    categoryPageFileName(leaf.categorySlugPath)
  );

  let categoryPage =
    !forceRescrape && existsSync(categoryPagePath)
      ? (JSON.parse(readFileSync(categoryPagePath, "utf8")) as Awaited<
          ReturnType<typeof scrapeAndWriteCategoryPage>
        >["categoryPage"])
      : null;

  if (categoryPage) {
    console.log(
      `Category ${leaf.categorySlugPath.join("/")}: ${categoryPage.products.length} products (cached page)`
    );
  } else {
    const result = await scrapeAndWriteCategoryPage({
      categorySlugPath: leaf.categorySlugPath,
      sourceUrl: leaf.sourceUrl,
    });
    categoryPage = result.categoryPage;
    console.log(
      `Category ${leaf.categorySlugPath.join("/")}: ${categoryPage.products.length} products`
    );
  }

  manifest.categoryPages[categoryPage.sourceUrl] = {
    status: "complete",
    categorySlugPath: leaf.categorySlugPath,
    productCount: categoryPage.products.length,
    completedAt: new Date().toISOString().slice(0, 10),
  };

  for (const listing of categoryPage.products) {
    const existingManifest = manifest.products[listing.slug];
    const existingProduct = loadExistingProduct(listing.slug);

    if (
      !forceRescrape &&
      existingManifest?.status === "complete" &&
      existingProduct
    ) {
      const mergedPaths = mergeCategorySlugPaths(
        existingProduct.categorySlugPaths,
        [leaf.categorySlugPath]
      );

      if (mergedPaths.length !== existingProduct.categorySlugPaths.length) {
        existingProduct.categorySlugPaths = mergedPaths;
        writeProduct(existingProduct);
        console.log(`  Updated categories for ${listing.slug}`);
      }

      manifest.products[listing.slug] = {
        ...existingManifest,
        categorySlugPaths: mergedPaths,
      };
      continue;
    }

    const scraped = await scrapeDromexProduct(
      listing.sourceUrl,
      leaf.categorySlugPath
    );

    const mergedPaths = mergeCategorySlugPaths(
      existingProduct?.categorySlugPaths ?? [],
      [leaf.categorySlugPath]
    );

    const product: DromexProductSeed = {
      ...scraped,
      title: scraped.title || listing.title,
      productCode: scraped.productCode || listing.productCode,
      categorySlugPaths:
        mergedPaths.length > 0 ? mergedPaths : [leaf.categorySlugPath],
      primaryCategorySlugPath:
        existingProduct?.primaryCategorySlugPath ?? leaf.categorySlugPath,
    };

    const outputPath = writeProduct(product);
    manifest.products[listing.slug] = {
      status: "complete",
      sourceUrl: product.sourceUrl,
      completedAt: new Date().toISOString().slice(0, 10),
      categorySlugPaths: product.categorySlugPaths,
    };

    console.log(`  Scraped ${listing.slug} -> ${outputPath}`);
  }

  saveManifest(manifest);
}

const productCount = readdirSync(productsDir).filter((file) =>
  file.endsWith(".json")
).length;

console.log(`Done. ${productCount} product JSON files in ${productsDir}`);
