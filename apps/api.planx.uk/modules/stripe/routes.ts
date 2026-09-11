import express, { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { createCheckoutSession, handleStripeWebhook } from "./controller.js";
import { verifyStripeWebhook } from "./middleware.js";
import { createCheckoutSessionSchema } from "./types.js";

const router = Router();

router.post(
  "/stripe/checkout-session/:localAuthority",
  validate(createCheckoutSessionSchema),
  createCheckoutSession,
);

// Stripe authenticates via the `stripe-signature` header, and signature verification requires
// the raw request body
// Docs: https://docs.stripe.com/webhooks/signature
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  verifyStripeWebhook,
  handleStripeWebhook,
);

export default router;
