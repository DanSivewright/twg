import type { ProductAttributes } from "../../../schema/commerce/product-attributes";

/** Scraped product record — one file per product under data/dromex/products/ */
export interface DromexProductSeed {
  attributes: ProductAttributes | null;
  categorySlugPaths: string[][];
  datasheetUrl: string | null;
  description: string | null;
  media: Array<{
    url: string;
    fileName: string | null;
    altText: string | null;
    mimeType: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  primaryCategorySlugPath: string[];
  productCode: string | null;
  scrapedAt: string;
  shortDescription: string | null;
  slug: string;
  sourceUrl: string;
  title: string;
  variants: Array<{
    sku: string;
    size: string | null;
    colour: string | null;
  }>;
}
