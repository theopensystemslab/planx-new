import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { createCheckoutSession } from "./controller.js";
import { createCheckoutSessionSchema } from "./types.js";

const router = Router();

router.post(
  "/stripe/checkout-session/:localAuthority",
  validate(createCheckoutSessionSchema),
  createCheckoutSession,
);

export default router;
