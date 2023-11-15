import { Router } from "express";
import { useSendEmailAuth } from "../auth/middleware";
import {
  confirmationEmailController,
  confirmationEmailSchema,
  paymentEmailController,
  paymentEmailSchema,
  singleApplicationEmailController,
  singleApplicationEmailSchema,
} from "./controller";
import { sendEmailLimiter } from "../../rateLimit";
import { validate } from "../../shared/middleware/validate";

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
  "/send-email/:template",
  sendEmailLimiter,
  useSendEmailAuth,
  validate(paymentEmailSchema),
  paymentEmailController,
);

export default router;
