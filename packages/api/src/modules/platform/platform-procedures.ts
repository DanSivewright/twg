import { implementer } from "../../implement/os";
import { requireAuth } from "../../middleware/auth";

export const healthCheck = implementer.healthCheck.handler(() => "OK");

export const privateData = implementer.privateData
  .use(requireAuth)
  .handler(({ context }) => ({
    message: "This is private",
    user: context.session.user,
  }));

export const platformRouter = {
  healthCheck,
  privateData,
};
