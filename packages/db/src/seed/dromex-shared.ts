import { and, eq, isNull } from "drizzle-orm";

import type { createDb } from "../index";
import { category } from "../schema";

export const DROMEX_ORG_ID = "atGur6JORJcr47X18Vj5leTV0VVRNKcf";

export async function resolveCategoryUidBySlugPath(
  db: ReturnType<typeof createDb>,
  organizationId: string,
  slugPath: string[]
) {
  let parentUid: string | null = null;

  for (const slug of slugPath) {
    const [row] = await db
      .select({ uid: category.uid })
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
      return null;
    }

    parentUid = row.uid;
  }

  return parentUid;
}

export async function upsertCategory(
  db: ReturnType<typeof createDb>,
  input: {
    organizationId: string;
    slug: string;
    name: string;
    description?: string;
    parentCategoryUid?: string;
    sortOrder: number;
  }
) {
  const existing = await db
    .select({ uid: category.uid })
    .from(category)
    .where(
      and(
        eq(category.organizationId, input.organizationId),
        eq(category.slug, input.slug)
      )
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(category)
      .set({
        name: input.name,
        description: input.description,
        parentCategoryUid: input.parentCategoryUid ?? null,
        sortOrder: input.sortOrder,
      })
      .where(eq(category.uid, existing[0].uid));

    return existing[0].uid;
  }

  const [created] = await db
    .insert(category)
    .values({
      organizationId: input.organizationId,
      slug: input.slug,
      name: input.name,
      description: input.description,
      parentCategoryUid: input.parentCategoryUid,
      sortOrder: input.sortOrder,
    })
    .returning({ uid: category.uid });

  return created.uid;
}
