import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeDromexUrl } from "./dromex-url";
import { scrapeAndWriteProduct } from "./scrape-dromex-product";

const seedDir = dirname(fileURLToPath(import.meta.url));

interface CategoryPageSeed {
  categorySlugPath: string[];
  products: Array<{
    slug: string;
    title: string;
    productCode: string;
    sourceUrl: string;
  }>;
  sourceUrl: string;
}

const categoryPagePath = join(
  seedDir,
  "data/dromex/category-pages/ppe-gloves-cut-5.json"
);
const manifestPath = join(seedDir, "data/dromex/crawl-manifest.json");

const categoryPage = JSON.parse(
  readFileSync(categoryPagePath, "utf8")
) as CategoryPageSeed;

const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
  products: Record<
    string,
    { status: string; sourceUrl: string; completedAt: string }
  >;
  updatedAt: string | null;
};

for (const item of categoryPage.products) {
  const sourceUrl = normalizeDromexUrl(item.sourceUrl);
  const result = await scrapeAndWriteProduct({
    sourceUrl,
    primaryCategorySlugPath: categoryPage.categorySlugPath,
  });

  manifest.products[item.slug] = {
    status: "complete",
    sourceUrl: result.product.sourceUrl,
    completedAt: new Date().toISOString().slice(0, 10),
  };

  console.log(`Scraped ${item.slug} -> ${result.outputPath}`);
}

manifest.updatedAt = new Date().toISOString().slice(0, 10);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
