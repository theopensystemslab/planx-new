import { Router } from "express";
import { useSendEmailAuth } from "../auth/middleware.js";
import {
  confirmationEmailController,
  paymentEmailController,
  resendEmailController,
  singleApplicationEmailController,
} from "./controller.js";
import { sendEmailLimiter } from "../../rateLimit.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  confirmationEmailSchema,
  paymentEmailSchema,
  resendEmailSchema,
  singleApplicationEmailSchema,
} from "./types.js";

const router = Router();

router.post(
  `/send-email/:template(reminder|expiry|save)`,
  sendEmailLimiter,
  useSendEmailAuth,
  validate(singleApplicationEmailSchema),
  singleApplicationEmailController,
);

router.post(
  "/send-email/:template(confirmation)",
  sendEmailLimiter,
  useSendEmailAuth,
  validate(confirmationEmailSchema),
  confirmationEmailController,
);

router.post(
  "/send-email/:template(welcome)",
  useSendEmailAuth,
  validate(resendEmailSchema),
  resendEmailController,
);

router.post(
  "/send-email/:template",
  sendEmailLimiter,
  useSendEmailAuth,
  validate(paymentEmailSchema),
  paymentEmailController,
);

export default router;
