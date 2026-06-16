import type { RouterClient } from "@orpc/server";

import { implementer } from "../implement/os";
import { platformRouter } from "../modules/platform/platform-procedures";
import { storefrontRouter } from "../modules/storefront/storefront-procedures";

export const appRouter = implementer.router({
  ...platformRouter,
  storefront: storefrontRouter,
});

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
