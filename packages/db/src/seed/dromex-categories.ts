import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { createDb } from "../index";
import { DROMEX_ORG_ID, upsertCategory } from "./dromex-shared";

const seedDir = dirname(fileURLToPath(import.meta.url));

interface CategorySeedNode {
  children?: CategorySeedNode[];
  description?: string;
  name: string;
  slug: string;
  sourceUrl?: string;
}

interface CategoriesSeedFile {
  categories: CategorySeedNode[];
}

function loadCategoriesSeed(): CategoriesSeedFile {
  const path = join(seedDir, "data/dromex/categories.json");
  return JSON.parse(readFileSync(path, "utf8")) as CategoriesSeedFile;
}

async function seedCategoryNodes(
  db: ReturnType<typeof createDb>,
  nodes: CategorySeedNode[],
  parentCategoryUid?: string
) {
  const categoryUids: Record<string, string> = {};

  for (const [index, node] of nodes.entries()) {
    const uid = await upsertCategory(db, {
      organizationId: DROMEX_ORG_ID,
      slug: node.slug,
      name: node.name,
      description: node.description,
      parentCategoryUid,
      sortOrder: index,
    });

    categoryUids[node.slug] = uid;

    if (node.children?.length) {
      const childUids = await seedCategoryNodes(db, node.children, uid);
      Object.assign(categoryUids, childUids);
    }
  }

  return categoryUids;
}

export async function seedDromexCategories(db: ReturnType<typeof createDb>) {
  const seed = loadCategoriesSeed();
  const categoryUids = await seedCategoryNodes(db, seed.categories);

  return {
    organizationId: DROMEX_ORG_ID,
    categoryCount: Object.keys(categoryUids).length,
    categoryUids,
  };
}
