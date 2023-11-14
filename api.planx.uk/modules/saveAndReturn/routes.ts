import { Router } from "express";

import {
  resumeApplicationController,
  resumeApplicationSchema,
} from "./controller";
import { sendEmailLimiter } from "../../rateLimit";
import { validate } from "../../shared/middleware/validate";
import { validateSession } from "./service/validateSession";

const router = Router();

router.post(
  "/resume-application",
  sendEmailLimiter,
  validate(resumeApplicationSchema),
  resumeApplicationController,
);
router.post("/validate-session", validateSession);

export default router;
