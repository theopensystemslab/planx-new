import { Router } from "express";

import { validate } from "./../../shared/middleware/validate.js";
import {
  logAnalyticsSchema,
  logUserExitController,
  logUserResumeController,
} from "./analyticsLog/controller.js";

const router = Router();

router.post(
  "/analytics/log-user-exit",
  validate(logAnalyticsSchema),
  logUserExitController,
);
router.post(
  "/analytics/log-user-resume",
  validate(logAnalyticsSchema),
  logUserResumeController,
);

export default router;
