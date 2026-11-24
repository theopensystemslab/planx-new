import { Router } from "express";

import { sendEmailLimiter } from "../../rateLimit.js";
import { validate } from "../../shared/middleware/validate.js";
import { useSendEmailAuth } from "../auth/middleware.js";
import {
  confirmationEmailController,
  paymentEmailController,
  remittanceEmailController,
  singleApplicationEmailController,
  welcomeEmailController,
} from "./controller.js";
import { useWelcomeEmailGuard } from "./middleware.js";
import {
  confirmationEmailSchema,
  paymentEmailSchema,
  remittanceEmailSchema,
  singleApplicationEmailSchema,
  welcomeEmailSchema,
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
  useWelcomeEmailGuard,
  validate(welcomeEmailSchema),
  welcomeEmailController,
);

router.post(
  "/send-email/:template(remittance)",
  useSendEmailAuth,
  validate(remittanceEmailSchema),
  remittanceEmailController,
);

router.post(
  "/send-email/:template",
  sendEmailLimiter,
  useSendEmailAuth,
  validate(paymentEmailSchema),
  paymentEmailController,
);

export default router;
