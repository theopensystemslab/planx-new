import { ServerError } from "../../../errors/index.js";
import { migrateToStripe } from "./service.js";
import type { MigrateController } from "./types.js";

export const migrate: MigrateController = async (_req, res, next) => {
  try {
    const { team } = res.locals;
    const result = await migrateToStripe(team.id, team.slug);

    const status = result.canMigrate ? 200 : 409;
    return res.status(status).send(result);
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to migrate to Stripe",
        cause: error,
      }),
    );
  }
};
