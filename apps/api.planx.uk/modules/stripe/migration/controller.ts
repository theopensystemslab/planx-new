import { ServerError } from "../../../errors/index.js";
import { getMigrationBlockers } from "./service.js";
import type { GetCanMigrateController } from "./types.js";

export const getCanMigrate: GetCanMigrateController = async (
  _req,
  res,
  next,
) => {
  try {
    const { team } = res.locals;
    const result = await getMigrationBlockers(team.id, team.slug);
    return res.send(result);
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to check Stripe migration ability",
        cause: error,
      }),
    );
  }
};
