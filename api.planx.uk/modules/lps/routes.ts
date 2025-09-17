import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { applicationsSchema } from "./types/applications.js";
import { loginSchema } from "./types/login.js";
import { applicationsController, loginController } from "./controller.js";
import { validateMagicLinkStatus } from "./middleware/validateMagicLinkStatus.js";

const router = Router();

router.post("/lps/login", validate(loginSchema), loginController);
router.post(
  "/lps/applications",
  validate(applicationsSchema),
  validateMagicLinkStatus,
  applicationsController,
);

export default router;
