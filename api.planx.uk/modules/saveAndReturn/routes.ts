import { Router } from "express";

import {
  resumeApplicationController,
  validateSessionController,
} from "./controller.js";
import { sendEmailLimiter } from "../../rateLimit.js";
import { validate } from "../../shared/middleware/validate.js";
import { resumeApplicationSchema, validateSessionSchema } from "./types.js";

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
