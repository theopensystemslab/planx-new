import { ServerError } from "../../../errors/index.js";
import { createStripeCheckoutSession } from "./service.js";
import type { CreateCheckoutSessionController } from "./types.js";

/**
 * Create a Stripe Checkout Session and return the hosted checkout URL
 */
export const createCheckoutSession: CreateCheckoutSessionController = async (
  _req,
  res,
  next,
) => {
  const { localAuthority } = res.locals.parsedReq.params;
  const { sessionId, flowId, amount, returnURL } = res.locals.parsedReq.body;

  try {
    const result = await createStripeCheckoutSession({
      sessionId,
      flowId,
      amount,
      returnURL,
      teamSlug: localAuthority,
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
