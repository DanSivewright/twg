import { implement } from "@orpc/server";

import type { Context } from "../context";
import { routerContract } from "../contracts";

export const implementer = implement(routerContract).$context<Context>();
