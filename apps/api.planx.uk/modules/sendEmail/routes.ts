import { Router } from "express";

import { sendEmailLimiter } from "../../rateLimit.js";
import { validate } from "../../shared/middleware/validate.js";
import { useSendEmailAuth } from "../auth/middleware.js";
import {
  confirmationEmailController,
  paymentEmailController,
  resendEmailController,
  singleApplicationEmailController,
} from "./controller.js";
import {
  confirmationEmailSchema,
  paymentEmailSchema,
  resendEmailSchema,
  singleApplicationEmailSchema,
} from "./types.js";

const router = Router();

router.post(
  `/send-email/:template(reminder|expiry|save|general-reminder|general-expiry|general-save)`,
  sendEmailLimiter,
  useSendEmailAuth,
  validate(singleApplicationEmailSchema),
  singleApplicationEmailController,
);

router.post(
  "/send-email/:template(confirmation|general-confirmation)",
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
