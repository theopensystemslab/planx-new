import { validate } from "./../../shared/middleware/validate.js";
import { Router } from "express";
import {
  logAnalyticsSchema,
  logUserExitController,
  logUserResumeController,
} from "./analyticsLog/controller.js";
import {
  checkCollectionsController,
  newCollectionController,
  newCollectionSchema,
} from "./metabase/collection/controller.js";
import {
  copyDashboardController,
  copyDashboardSchema,
  generatePublicLinkController,
  generatePublicLinkSchema,
} from "./metabase/dashboard/controller.js";

const router = Router();

// Analytics logging routes
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

// Collection routes
router.get(
  "/collections/check",
  checkCollectionsController, // TODO add validation
);

router.post(
  "/collections/new",
  validate(newCollectionSchema),
  newCollectionController,
);

// Dashboard routes
router.post(
  "/dashboard/copy",
  validate(copyDashboardSchema),
  copyDashboardController,
);

router.post(
  "/dashboard/:dashboardId/public_link",
  validate(generatePublicLinkSchema),
  generatePublicLinkController,
);

export default router;
