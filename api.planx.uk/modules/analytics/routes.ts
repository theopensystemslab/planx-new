import { validate } from "./../../shared/middleware/validate.js";
import { Router } from "express";
import {
  logAnalyticsSchema,
  logUserExitController,
  logUserResumeController,
} from "./analyticsLog/controller.js";
import { metabaseCollectionsController } from "./metabase/collection/controller.js";
import { metabaseDashboardsController } from "./metabase/dashboard/controller.js";
import { createTeamCollectionSchema } from "./metabase/collection/types.js";
import { createNewDashboardSchema } from "./metabase/dashboard/types.js";
import { useEnvGuard } from "../../shared/middleware/useEnvGuard.js";

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

router.use(
  "/metabase",
  useEnvGuard(["test", "staging", "production"]), // "development" is removed to avoid Metabase staging noise, but when working on Metabase features locally it's useful to include it in the allow list (to hook local Hasura / editor up with Metabase staging)
);

router.post(
  "/metabase/collection",
  validate(createTeamCollectionSchema),
  metabaseCollectionsController,
);
router.post(
  "/metabase/dashboard",
  validate(createNewDashboardSchema),
  metabaseDashboardsController,
);

export default router;
