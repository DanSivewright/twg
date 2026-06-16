import { ORPCError } from "@orpc/server";

import { implementer } from "../implement/os";

export const requireTenant = implementer.middleware(
  async ({ context, next }) => {
    if (!context.tenant) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Organization context is required",
      });
    }

    return next({
      context: {
        tenant: context.tenant,
      },
    });
  }
);
