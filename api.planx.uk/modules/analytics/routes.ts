import { validate } from "./../../shared/middleware/validate.js";
import { Router } from "express";
import {
  logAnalyticsSchema,
  logUserExitController,
  logUserResumeController,
} from "./analyticsLog/controller.js";
import { metabaseDashboardsController } from "./metabase/controller.js";
import { createNewDashboardLinkSchema } from "./metabase/types.js";
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
  // "test" is removed because the api tests mock metabase calls, and the e2e tests don't need to actually hit Metabase either
  useEnvGuard(["staging", "production"]), // "development" is removed to avoid Metabase staging noise, but when working on Metabase features locally it's useful to include it in the allow list (to hook local Hasura / editor up with Metabase staging)
);

router.post(
  "/metabase/dashboard",
  validate(createNewDashboardLinkSchema),
  metabaseDashboardsController,
);

export default router;
