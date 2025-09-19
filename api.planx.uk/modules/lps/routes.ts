import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { applicationsSchema } from "./types/applications.js";
import { loginSchema } from "./types/login.js";
import {
  applicationsController,
  downloadHTMLController,
  generateDownloadTokenController,
  loginController,
} from "./controller.js";
import { validateMagicLinkStatus } from "./middleware/validateMagicLinkStatus.js";
import { generateDownloadTokenSchema } from "./types/downloadToken.js";
import { validateSessionStatus } from "./middleware/validateSessionStatus.js";
import { downloadHTMLSchema } from "./types/downloadHTML.js";
import { validateDownloadToken } from "./middleware/validateDownloadToken.js";

const router = Router();

router.post("/lps/login", validate(loginSchema), loginController);
router.post(
  "/lps/applications",
  validate(applicationsSchema),
  validateMagicLinkStatus,
  applicationsController,
);
router.post(
  "/lps/download/token",
  validate(generateDownloadTokenSchema),
  validateSessionStatus,
  generateDownloadTokenController,
);
router.post(
  "/lps/download/html",
  validate(downloadHTMLSchema),
  validateDownloadToken,
  downloadHTMLController,
);

export default router;
