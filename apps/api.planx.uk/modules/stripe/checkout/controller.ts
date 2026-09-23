import { ServerError } from "../../../errors/index.js";
import {
  createStripeCheckoutSession,
  getStripeCheckoutSessionStatus,
} from "./service.js";
import type {
  CreateCheckoutSessionController,
  GetCheckoutSessionStatusController,
} from "./types.js";

/**
 * Create a Stripe Checkout Session and return the hosted checkout URL
 */
export const createCheckoutSession: CreateCheckoutSessionController = async (
  _req,
  res,
  next,
) => {
  const { localAuthority } = res.locals.parsedReq.params;
  const { sessionId, flowId, amount, returnURL, metadata } =
    res.locals.parsedReq.body;
  const { connectedAccountId } = res.locals;

  try {
    const result = await createStripeCheckoutSession({
      sessionId,
      flowId,
      amount,
      returnURL,
      teamSlug: localAuthority,
      connectedAccountId,
      metadata,
    });

    return res.json(result);
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to create Stripe Checkout Session for ${localAuthority}`,
        status: 500,
        cause: error,
      }),
    );
  }
};

/**
 * Retrieve a Checkout Session's status
 *
 * @description Checked by the Pay component in order to determine how to proceed when a user
 * returns to PlanX. The webhook remains the source of truth for completion - this is the synchronous
 * check (Stripe's recommended pattern).
 *
 * @docs https://docs.stripe.com/checkout/fulfillment
 */
export const getCheckoutSessionStatus: GetCheckoutSessionStatusController =
  async (_req, res, next) => {
    const { localAuthority, checkoutSessionId } = res.locals.parsedReq.params;

    try {
      const result = await getStripeCheckoutSessionStatus(checkoutSessionId);

      return res.json(result);
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to retrieve Stripe Checkout Session ${checkoutSessionId} for ${localAuthority}`,
          status: 500,
          cause: error,
        }),
      );
    }
  };
