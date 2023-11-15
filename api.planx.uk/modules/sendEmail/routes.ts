import { Router } from "express";
import { useSendEmailAuth } from "../auth/middleware";
import { routeSendEmailRequest } from "./controller";
import { sendEmailLimiter } from "../../rateLimit";

const router = Router();

router.post(
  "/send-email/:template",
  sendEmailLimiter,
  useSendEmailAuth,
  routeSendEmailRequest,
);

export default router;
