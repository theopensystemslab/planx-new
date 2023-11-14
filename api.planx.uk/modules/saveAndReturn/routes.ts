import { Router } from "express";

import {
  resumeApplicationController,
  resumeApplicationSchema,
  validateSessionController,
  validateSessionSchema,
} from "./controller";
import { sendEmailLimiter } from "../../rateLimit";
import { validate } from "../../shared/middleware/validate";

const router = Router();

router.post(
  "/resume-application",
  sendEmailLimiter,
  validate(resumeApplicationSchema),
  resumeApplicationController,
);
router.post(
  "/validate-session",
  validate(validateSessionSchema),
  validateSessionController,
);

export default router;
