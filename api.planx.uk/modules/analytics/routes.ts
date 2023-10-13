import { validate } from "./../../shared/middleware/validate";
import { Router } from "express";
import {
  logAnalyticsSchema,
  logUserExitController,
  logUserResumeController,
  logUserResetController,
} from "./controller";

const router = Router();

router.post(
  "/log-user-exit",
  validate(logAnalyticsSchema),
  logUserExitController,
);
router.post(
  "/log-user-resume",
  validate(logAnalyticsSchema),
  logUserResumeController,
);
router.post(
  "/log-user-reset",
  validate(logAnalyticsSchema),
  logUserResetController,
);

export default router;
