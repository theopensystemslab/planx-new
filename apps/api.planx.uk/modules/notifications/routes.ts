import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import {
  resolveNotificationController,
  resolveNotificationEventSchema,
} from "./controller.js";

const router = Router();

router.post(
  "/resolve-notification",
  validate(resolveNotificationEventSchema),
  resolveNotificationController,
);

export default router;
