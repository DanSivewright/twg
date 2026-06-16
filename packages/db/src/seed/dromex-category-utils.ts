import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const seedDir = dirname(fileURLToPath(import.meta.url));

export interface CategorySeedNode {
  children?: CategorySeedNode[];
  description?: string;
  name: string;
  slug: string;
  sourceUrl?: string;
}

export interface CategoriesSeedFile {
  categories: CategorySeedNode[];
}

export interface CategoryLeaf {
  categorySlugPath: string[];
  name: string;
  sourceUrl: string;
}

export function loadCategoriesSeed(): CategoriesSeedFile {
  const path = join(seedDir, "data/dromex/categories.json");
  return JSON.parse(readFileSync(path, "utf8")) as CategoriesSeedFile;
}

export function categoryPageFileName(categorySlugPath: string[]) {
  return `${categorySlugPath.join("-")}.json`;
}

export function collectCategoryLeaves(
  nodes: CategorySeedNode[],
  parentSlugPath: string[] = []
): CategoryLeaf[] {
  const leaves: CategoryLeaf[] = [];

  for (const node of nodes) {
    const slugPath = [...parentSlugPath, node.slug];

    if (node.children?.length) {
      leaves.push(...collectCategoryLeaves(node.children, slugPath));
      continue;
    }

    if (node.sourceUrl) {
      leaves.push({
        categorySlugPath: slugPath,
        name: node.name,
        sourceUrl: node.sourceUrl,
      });
    }
  }

  return leaves;
}

export function collectAllCategoryLeaves(): CategoryLeaf[] {
  const seed = loadCategoriesSeed();
  return collectCategoryLeaves(seed.categories);
}
