import {
  getStripeAccountId,
  getTeamBySlug,
  isAccountReadyForPayments,
} from "../connect/service.js";
import { buildReturnURL, getReturnURLContext } from "./returnURL.js";
import type {
  ResolveReturnURLMiddleware,
  ResolveTeamPaymentProviderMiddleware,
} from "./types.js";

export const resolveTeamPaymentProvider: ResolveTeamPaymentProviderMiddleware =
  async (_req, res, next) => {
    const { localAuthority } = res.locals.parsedReq.params;

    try {
      const team = await getTeamBySlug(localAuthority);
      const { paymentProvider } = team.settings;

      if (paymentProvider !== "stripe") {
        return next({
          status: 409,
          message: `Stripe payments are not enabled for this local authority (${localAuthority})`,
        });
      }

      const stripeAccountId = await getStripeAccountId(team.id);
      if (!stripeAccountId) {
        return next({
          status: 409,
          message: `This local authority (${localAuthority}) has not connected a Stripe account`,
        });
      }

      // Only pay out to an account which is connected to our platform - never to an unknown account id
      if (!(await isAccountReadyForPayments(stripeAccountId))) {
        return next({
          status: 409,
          message: `The Stripe account for this local authority (${localAuthority}) is not connected or cannot take payments`,
        });
      }

      res.locals.connectedAccountId = stripeAccountId;

      return next();
    } catch (error) {
      return next(error);
    }
  };

/**
 * Build the URL Stripe sends the applicant back to after checkout
 *
 * Derived server-side from the flow and session so a Checkout Session can never send applicants
 * on to a third-party site
 */
export const resolveReturnURL: ResolveReturnURLMiddleware = async (
  _req,
  res,
  next,
) => {
  const { localAuthority } = res.locals.parsedReq.params;
  const { flowId, sessionId } = res.locals.parsedReq.body;

  try {
    const { flow, session } = await getReturnURLContext(flowId, sessionId);

    if (!flow || flow.team.slug !== localAuthority) {
      return next({
        status: 400,
        message: `Flow ${flowId} not found for this local authority (${localAuthority})`,
      });
    }

    if (session && session.flowId !== flowId) {
      return next({
        status: 400,
        message: `Session ${sessionId} does not belong to flow ${flowId}`,
      });
    }

    if (session?.lockedAt) {
      return next({
        status: 409,
        message: `Cannot initialise a new payment for locked session ${sessionId}`,
      });
    }

    res.locals.returnURL = buildReturnURL(flow, sessionId, session?.email);

    return next();
  } catch (error) {
    return next(error);
  }
};
