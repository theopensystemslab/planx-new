import type { Request, RequestHandler } from "express";
import type Stripe from "stripe";

export type StripeWebhookController = RequestHandler<
  Request["params"],
  unknown,
  Request["body"],
  Request["query"],
  { stripeEvent: Stripe.Event }
>;
