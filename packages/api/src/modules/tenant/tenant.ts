import { member, organization } from "@twg/db/schema/auth";
import { and, eq } from "drizzle-orm";

import { createDb } from "../../lib/db";

export interface OrganizationTenant {
  name: string;
  organizationId: string;
  slug: string;
}

interface OrganizationMetadata {
  storeDomain?: string;
}

function parseOrganizationMetadata(
  metadata: string | null
): OrganizationMetadata {
  if (!metadata) {
    return {};
  }

  try {
    return JSON.parse(metadata) as OrganizationMetadata;
  } catch {
    return {};
  }
}

export async function findOrganizationBySlug(
  slug: string
): Promise<OrganizationTenant | null> {
  const db = createDb();
  const [row] = await db
    .select({
      organizationId: organization.id,
      slug: organization.slug,
      name: organization.name,
    })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);

  if (!row) {
    return null;
  }

  return row;
}

export async function findOrganizationByStoreDomain(
  hostname: string
): Promise<OrganizationTenant | null> {
  const db = createDb();
  const organizations = await db
    .select({
      organizationId: organization.id,
      slug: organization.slug,
      name: organization.name,
      metadata: organization.metadata,
    })
    .from(organization);

  for (const row of organizations) {
    const metadata = parseOrganizationMetadata(row.metadata);
    if (metadata.storeDomain?.toLowerCase() === hostname.toLowerCase()) {
      return {
        organizationId: row.organizationId,
        slug: row.slug,
        name: row.name,
      };
    }
  }

  return null;
}

export async function isOrganizationMember(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const db = createDb();
  const [row] = await db
    .select({ id: member.id })
    .from(member)
    .where(
      and(eq(member.organizationId, organizationId), eq(member.userId, userId))
    )
    .limit(1);

  return Boolean(row);
}
