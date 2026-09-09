import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { componentGuideController } from "./controller.js";
import { componentGuideSchema } from "./types.js";

const router = Router();

router.get(
  "/notion/component-guide",
  validate(componentGuideSchema),
  componentGuideController,
);

export default router;
