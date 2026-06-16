import { ORPCError } from "@orpc/server";

import { implementer } from "../implement/os";

export const requireAuth = implementer.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  return next({
    context: {
      session: context.session,
    },
  });
});
