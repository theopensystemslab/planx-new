import { Router } from "express";

import {
  resumeApplicationController,
  validateSessionController,
} from "./controller";
import { sendEmailLimiter } from "../../rateLimit";
import { validate } from "../../shared/middleware/validate";
import { resumeApplicationSchema, validateSessionSchema } from "./types";

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
