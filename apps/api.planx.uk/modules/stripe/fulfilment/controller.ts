import Stripe from "stripe";

import { ServerError } from "../../../errors/index.js";
import { fulfilPaymentRequest } from "./service.js";
import type { FulfilPaymentRequestController } from "./types.js";

/**
 * Fulfil an ITP request when the payer returns from Stripe Checkout
 *
 * @description The fast path for the payer's page - the webhook remains the guarantee
 *
 * @docs https://docs.stripe.com/checkout/fulfillment#create-payment-event-handler
 */
export const fulfilPaymentRequestController: FulfilPaymentRequestController =
  async (_req, res, next) => {
    const { paymentRequestId } = res.locals.parsedReq.params;
    const { checkoutSessionId } = res.locals.parsedReq.body;

    try {
      const result = await fulfilPaymentRequest(checkoutSessionId, {
        expectedPaymentRequestId: paymentRequestId,
      });

      switch (result.status) {
        case "fulfilled":
        case "alreadyFulfilled":
          return res.json({
            paymentStatus: result.paymentStatus,
            paymentIntentId: result.stripePaymentId,
          });
        case "unpaid":
          return next({
            status: 409,
            message: `Checkout Session ${checkoutSessionId} has not been paid`,
          });
        case "notFound":
          return next({
            status: 404,
            message: `Payment request ${paymentRequestId} not found`,
          });
        case "notPaymentRequest":
        case "foreign":
        case "mismatch":
          return next({
            status: 400,
            message: `Checkout Session ${checkoutSessionId} does not belong to payment request ${paymentRequestId} (${result.status})`,
          });
      }
    } catch (error) {
      if (isUnknownCheckoutSession(error)) {
        return next({
          status: 404,
          message: `Checkout Session ${checkoutSessionId} not found`,
        });
      }

      return next(
        new ServerError({
          message: `Failed to fulfil payment request ${paymentRequestId} from Checkout Session ${checkoutSessionId}`,
          cause: error,
        }),
      );
    }
  };

const isUnknownCheckoutSession = (error: unknown): boolean =>
  error instanceof Stripe.errors.StripeInvalidRequestError &&
  error.code === "resource_missing";
