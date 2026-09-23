import type { RequestHandler } from "express";
import { readFileSync } from "fs";

import { stripe } from "../client.js";

/**
 * Resolve the webhook signing secret
 *
 * `STRIPE_WEBHOOK_SECRET_FILE` is used locally and on pizzas - it's written at runtime by the `stripe-cli`
 * Docker sidecar (see docker-compose.yml), so is read per request to pick up a restarted listener
 * `STRIPE_WEBHOOK_SECRET` is used on staging and production, set via Pulumi for their dashboard endpoints
 */
const getWebhookSecret = (): string | undefined => {
  const secretFile = process.env.STRIPE_WEBHOOK_SECRET_FILE;
  if (secretFile) {
    try {
      const secret = readFileSync(secretFile, "utf8").trim();
      if (secret) return secret;
    } catch {
      // Sidecar not running (or not yet ready) - fall back to the env var
    }
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
};

/**
 * Verify the `stripe-signature` header and construct a Stripe.Event
 *
 * Docs: https://docs.stripe.com/webhooks/signature
 */
export const verifyStripeWebhook: RequestHandler = (req, res, next) => {
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).send("Missing stripe-signature header");
  }

  try {
    res.locals.stripeEvent = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret,
    );
    return next();
  } catch (error) {
    console.warn(`Stripe webhook signature verification failed: ${error}`);
    return res.status(400).send("Webhook signature verification failed");
  }
};
