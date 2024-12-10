import { validate } from "./../../shared/middleware/validate.js";
import { Router } from "express";
import {
  logAnalyticsSchema,
  logUserExitController,
  logUserResumeController,
} from "./analyticsLog/controller.js";
import { checkCollectionsController } from "./metabase/collection/controller.js";
import { checkCollectionsSchema } from "./metabase/collection/types.js";

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
router.post(
  "/collection",
  validate(checkCollectionsSchema),
  checkCollectionsController,
);

export default router;
