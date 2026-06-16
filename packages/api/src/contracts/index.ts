import { platformContract } from "../modules/platform/platform-contract";
import { storefrontContract } from "../modules/storefront/storefront-contract";

export const routerContract = {
  ...platformContract,
  storefront: storefrontContract,
};

export type RouterContract = typeof routerContract;
