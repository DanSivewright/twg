import type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";

import type { RouterContract } from "./index";

export type ContractInputs = InferContractRouterInputs<RouterContract>;
export type ContractOutputs = InferContractRouterOutputs<RouterContract>;
