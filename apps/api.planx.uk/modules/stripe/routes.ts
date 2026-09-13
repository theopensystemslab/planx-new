import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { useTeamEditorAuth } from "../auth/middleware.js";
import * as Controller from "./controller.js";
import { requireStripeConnectTeamAuth } from "./middleware.js";
import { connectCallbackSchema, connectSchema } from "./types.js";

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

export default router;
