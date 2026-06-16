import { oc } from "@orpc/contract";
import { z } from "zod";

import { userSchema } from "./schemas/user";

export const healthCheckContract = oc.output(z.literal("OK"));

export const privateDataContract = oc.output(
  z.object({
    message: z.string(),
    user: userSchema,
  })
);

export const platformContract = {
  healthCheck: healthCheckContract,
  privateData: privateDataContract,
};
