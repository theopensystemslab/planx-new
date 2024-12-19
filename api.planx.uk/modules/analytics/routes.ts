import { validate } from "./../../shared/middleware/validate.js";
import { Router } from "express";
import {
  logAnalyticsSchema,
  logUserExitController,
  logUserResumeController,
} from "./analyticsLog/controller.js";
import { metabaseCollectionsController } from "./metabase/collection/controller.js";
import { createTeamCollectionSchema } from "./metabase/collection/types.js";

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
  validate(createTeamCollectionSchema),
  metabaseCollectionsController,
);

export default router;
