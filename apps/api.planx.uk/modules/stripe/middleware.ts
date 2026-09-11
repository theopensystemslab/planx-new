import type { RequestHandler } from "express";

import { stripe } from "./client.js";

/**
 * Verify the `stripe-signature` header and construct a Stripe.Event
 *
 * Docs: https://docs.stripe.com/webhooks/signature
 */
export const verifyStripeWebhook: RequestHandler = (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).send("Missing stripe-signature header");
  }

  try {
    res.locals.stripeEvent = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
    return next();
  } catch (error) {
    console.warn(`Stripe webhook signature verification failed: ${error}`);
    return res.status(400).send("Webhook signature verification failed");
  }
};
