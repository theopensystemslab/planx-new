import { ServerError } from "../../../errors/index.js";
import { getMigrationAbilityReasons } from "./service.js";
import type { GetMigrationAbilityController } from "./types.js";

export const getMigrationAbility: GetMigrationAbilityController = async (
  _req,
  res,
  next,
) => {
  try {
    const { team } = res.locals;
    const result = await getMigrationAbilityReasons(team.id, team.slug);
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
