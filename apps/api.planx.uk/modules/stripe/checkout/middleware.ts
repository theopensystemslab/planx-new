import { getStripeAccountId, getTeamBySlug } from "../connect/service.js";
import type { ResolveTeamPaymentProviderMiddleware } from "./types.js";

export const resolveTeamPaymentProvider: ResolveTeamPaymentProviderMiddleware =
  async (_req, res, next) => {
    const { localAuthority } = res.locals.parsedReq.params;

    try {
      const team = await getTeamBySlug(localAuthority);
      const { paymentProvider } = team.settings;

      if (paymentProvider !== "stripe") {
        return next({
          status: 400,
          message: `Stripe payments are not enabled for this local authority (${localAuthority})`,
        });
      }

      const stripeAccountId = await getStripeAccountId(team.id);
      if (!stripeAccountId) {
        return next({
          status: 400,
          message: `This local authority (${localAuthority}) has not connected a Stripe account`,
        });
      }

      res.locals.connectedAccountId = stripeAccountId;

      return next();
    } catch (error) {
      return next(error);
    }
  };
