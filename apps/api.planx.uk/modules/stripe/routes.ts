import express, { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { useTeamEditorAuth } from "../auth/middleware.js";
import { createCheckoutSession } from "./checkout/controller.js";
import { createCheckoutSessionSchema } from "./checkout/types.js";
import * as Controller from "./connect/controller.js";
import { requireStripeConnectTeamAuth } from "./connect/middleware.js";
import { connectCallbackSchema, connectSchema } from "./connect/types.js";
import { handleStripeWebhook } from "./webhook/controller.js";
import { verifyStripeWebhook } from "./webhook/middleware.js";

export const STRIPE_WEBHOOK_ENDPOINT = "/stripe/webhook" as const;

const router = Router();

// Called by Stripe's redirect - the requester's identity comes from the signed session state set in initiateConnect, not a JWT.
router.get(
  "/stripe/connect/callback",
  validate(connectCallbackSchema),
  Controller.handleCallback,
);

router.get(
  "/stripe/connect/:teamSlug/status",
  useTeamEditorAuth,
  validate(connectSchema),
  requireStripeConnectTeamAuth,
  Controller.getConnectStatus,
);

router.get(
  "/stripe/connect/:teamSlug",
  useTeamEditorAuth,
  validate(connectSchema),
  requireStripeConnectTeamAuth,
  Controller.initiateConnect,
);

router.post(
  "/stripe/checkout-session/:localAuthority",
  validate(createCheckoutSessionSchema),
  // TODO: Guard on connected accounts only
  createCheckoutSession,
);

// Stripe authenticates via the `stripe-signature` header, and signature verification requires
// the raw request body
// Docs: https://docs.stripe.com/webhooks/signature
router.post(
  STRIPE_WEBHOOK_ENDPOINT,
  express.raw({ type: "application/json" }),
  verifyStripeWebhook,
  handleStripeWebhook,
);

export default router;
