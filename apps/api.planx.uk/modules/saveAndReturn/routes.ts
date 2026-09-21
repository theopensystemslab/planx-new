import { Router } from "express";

import { sendEmailLimiter } from "../../rateLimit.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  resumeApplicationController,
  validateSessionController,
} from "./controller.js";
import { resumeApplicationSchema, validateSessionSchema } from "./types.js";

const router = Router();

router.post(
  "/validate-session",
  validate(validateSessionSchema),
  validateSessionController,
);

export default router;
