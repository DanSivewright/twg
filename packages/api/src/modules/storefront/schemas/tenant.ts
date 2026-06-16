import { z } from "zod";

export const tenantInfoSchema = z.object({
  organizationId: z.string(),
  slug: z.string(),
  name: z.string(),
});
