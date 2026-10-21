import { ServerError } from "../../../errors/index.js";
import { migrateToStripe, revertToGovPay } from "./service.js";
import type { MigrateController, RevertController } from "./types.js";

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

export const revert: RevertController = async (_req, res, next) => {
  try {
    const { team } = res.locals;
    const paymentProvider = await revertToGovPay(team.id);

    return res.status(200).json({ paymentProvider });
  } catch (error) {
    return next(
      new ServerError({
        message: "Failed to revert to GOV.UK Pay",
        cause: error,
      }),
    );
  }
};
