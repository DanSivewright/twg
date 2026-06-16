import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { DromexProductSeed } from "./data/dromex/product.schema";
import { fetchDromexHtml } from "./dromex-fetch";
import { normalizeDromexUrl } from "./dromex-url";

const seedDir = dirname(fileURLToPath(import.meta.url));

const LIST_ITEM_REGEX = /<li[^>]*>([\s\S]*?)<\/li>/gi;
const OPTION_REGEX = /<option value="([^"]+)"[^>]*>([^<]+)<\/option>/gi;
const COLOUR_TOOLTIP_REGEX = /data-wvstooltip="([^"]+)"/gi;
const LARGE_IMAGE_REGEX = /data-large_image="([^"]+)"/gi;
const OG_IMAGE_REGEX = /property="og:image" content="([^"]+)"/gi;
const PRODUCT_VARIATIONS_REGEX = /data-product_variations="([^"]+)"/i;
const PRODUCT_TITLE_REGEX =
  /<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i;
const PAGE_TITLE_REGEX = /<title>([^<|]+)/i;
const PRODUCT_CODE_REGEX = /product-item-codes-title">([^<]+)</i;
const SIZES_REGEX =
  /<h6[^>]*>\s*Sizes:\s*(?:<span[^>]*>)?\s*([^<]+?)(?:<\/span>)?\s*<\/h6>/i;
const SIZE_RANGE_REGEX = /(\d+)\s*-\s*(\d+)/;
const STANDARDS_REGEX =
  /<h6[^>]*>\s*Product Rating:\s*(?:<span[^>]*>)?\s*([^<]+?)(?:<\/span>)?\s*<\/h6>/i;
const DATASHEET_REGEX =
  /<a[^>]*href="([^"]+\.pdf)"[^>]*id="download_data_sheet"[^>]*>/i;
const META_DESCRIPTION_REGEX = /<meta name="description" content="([^"]+)"/i;
const TAG_REGEX = /<[^>]+>/g;

function decodeHtml(text: string) {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&#039;", "'")
    .replaceAll("&quot;", '"')
    .trim();
}

function stripTags(html: string) {
  return decodeHtml(html.replaceAll(TAG_REGEX, " "));
}

function parseSectionItems(html: string, heading: string) {
  const pattern = new RegExp(
    `<h6[^>]*>${heading}</h6>[\\s\\S]*?<ul[^>]*>([\\s\\S]*?)</ul>`,
    "i"
  );
  const match = html.match(pattern);
  if (!match?.[1]) {
    return [];
  }

  return [...match[1].matchAll(LIST_ITEM_REGEX)]
    .map((item) => stripTags(item[1] ?? ""))
    .filter(Boolean);
}

function parseSizes(html: string) {
  const match = html.match(SIZES_REGEX);
  if (!match?.[1]) {
    return [];
  }

  const range = match[1].trim();
  if (!range) {
    return [];
  }

  const span = range.match(SIZE_RANGE_REGEX);
  if (!span) {
    return [range];
  }

  const start = Number(span[1]);
  const end = Number(span[2]);
  const sizes: string[] = [];

  for (let size = start; size <= end; size++) {
    sizes.push(String(size));
  }

  return sizes;
}

function parseStandards(html: string) {
  const match = html.match(STANDARDS_REGEX);
  if (!match?.[1]) {
    return [];
  }

  return match[1]
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseColours(html: string) {
  const colours = [...html.matchAll(OPTION_REGEX)]
    .map((item) => item[2]?.trim())
    .filter((value) => value && !value.startsWith("Choose"));

  if (colours.length > 0) {
    return colours;
  }

  return [...html.matchAll(COLOUR_TOOLTIP_REGEX)]
    .map((item) => item[1]?.trim())
    .filter(Boolean);
}

function parseImages(html: string) {
  const images = [
    ...html.matchAll(LARGE_IMAGE_REGEX),
    ...html.matchAll(OG_IMAGE_REGEX),
  ]
    .map((item) => normalizeDromexUrl(item[1]))
    .filter((url) => url.includes("dromex.co.za/wp-content/uploads/"));

  const unique = [...new Set(images)];

  return unique.map((url, index) => ({
    url,
    fileName: url.split("/").pop() ?? null,
    altText: null,
    mimeType: url.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
    isPrimary: index === 0,
    sortOrder: index,
  }));
}

function titleCaseColour(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseVariations(
  html: string,
  productCode: string | null,
  sizes: string[],
  colours: string[]
) {
  const match = html.match(PRODUCT_VARIATIONS_REGEX);
  if (match?.[1]) {
    const decoded = match[1]
      .replaceAll("&quot;", '"')
      .replaceAll("&#039;", "'")
      .replaceAll("&amp;", "&");

    try {
      const variations = JSON.parse(decoded) as Array<{
        attributes?: Record<string, string>;
        sku?: string;
      }>;

      const parsed = variations.map((variation, index) => {
        const colourSlug = variation.attributes?.attribute_pa_color;
        const colour = colourSlug ? titleCaseColour(colourSlug) : null;

        return {
          sku:
            variation.sku ||
            (productCode
              ? `${productCode}-${index + 1}`
              : `variant-${index + 1}`),
          size: null,
          colour,
        };
      });

      const hasMeaningfulVariants = parsed.some(
        (variant) => variant.colour !== null || variant.size !== null
      );

      if (parsed.length > 0 && hasMeaningfulVariants) {
        return parsed;
      }
    } catch {
      // Fall through to size/colour matrix below.
    }
  }

  if (sizes.length > 0) {
    return sizes.map((size, index) => ({
      sku: productCode ? `${productCode}-${size}` : `variant-${index + 1}`,
      size,
      colour: colours[index] ?? colours[0] ?? null,
    }));
  }

  if (colours.length > 0) {
    return colours.map((colour, index) => ({
      sku: productCode ? `${productCode}-${index + 1}` : `variant-${index + 1}`,
      size: null,
      colour,
    }));
  }

  return [];
}

export async function scrapeDromexProduct(
  sourceUrl: string,
  primaryCategorySlugPath: string[]
): Promise<DromexProductSeed> {
  const normalizedSourceUrl = normalizeDromexUrl(sourceUrl);
  const html = await fetchDromexHtml(normalizedSourceUrl);
  const slug =
    normalizedSourceUrl.split("/").filter(Boolean).at(-1) ??
    primaryCategorySlugPath.at(-1) ??
    "product";

  const title =
    stripTags(html.match(PRODUCT_TITLE_REGEX)?.[1] ?? "") ||
    stripTags(html.match(PAGE_TITLE_REGEX)?.[1] ?? slug);

  const productCode = html.match(PRODUCT_CODE_REGEX)?.[1]?.trim() ?? null;

  const features = parseSectionItems(html, "Product Information");
  const compositionItems = parseSectionItems(html, "Composition");
  const suitableFor = parseSectionItems(html, "Suitable For Use");
  const sizes = parseSizes(html);
  const colours = parseColours(html);
  const standards = parseStandards(html);

  const datasheetMatch = html.match(DATASHEET_REGEX);
  const datasheetUrl = datasheetMatch?.[1]
    ? normalizeDromexUrl(datasheetMatch[1])
    : null;

  const media = parseImages(html);
  const variants = parseVariations(html, productCode, sizes, colours);

  const description =
    features.length > 0
      ? features.slice(0, 3).join(". ")
      : stripTags(html.match(META_DESCRIPTION_REGEX)?.[1] ?? "") || null;

  const attributes: DromexProductSeed["attributes"] = {
    features,
    suitableFor,
  };

  if (compositionItems.length > 0) {
    attributes.composition = compositionItems.join("; ");
  }

  if (standards.length > 0) {
    attributes.standards = standards;
  }

  if (colours.length > 0) {
    attributes.colours = colours;
  }

  if (sizes.length > 0) {
    attributes.sizes = sizes;
  }

  return {
    slug,
    title,
    productCode,
    shortDescription: description,
    description,
    sourceUrl: normalizedSourceUrl,
    datasheetUrl,
    primaryCategorySlugPath,
    categorySlugPaths: [primaryCategorySlugPath],
    attributes,
    variants,
    media: media.map((item, index) => ({
      ...item,
      altText: index === 0 ? title : item.altText,
    })),
    scrapedAt: new Date().toISOString().slice(0, 10),
  };
}

export async function scrapeAndWriteProduct(input: {
  sourceUrl: string;
  primaryCategorySlugPath: string[];
}) {
  const product = await scrapeDromexProduct(
    input.sourceUrl,
    input.primaryCategorySlugPath
  );

  const outputPath = join(
    seedDir,
    "data/dromex/products",
    `${product.slug}.json`
  );
  writeFileSync(outputPath, `${JSON.stringify(product, null, 2)}\n`);

  return { outputPath, product };
}
