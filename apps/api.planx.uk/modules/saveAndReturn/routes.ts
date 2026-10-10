import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { validateSessionController } from "./controller.js";
import { validateSessionSchema } from "./types.js";

const router = Router();

router.post(
  "/validate-session",
  validate(validateSessionSchema),
  validateSessionController,
);

export default router;
