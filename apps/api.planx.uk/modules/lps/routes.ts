import { Router } from "express";

import { lpsLoginLimiter } from "../../rateLimit.js";
import { validate } from "../../shared/middleware/validate.js";
import {
  applicationsController,
  downloadHTMLController,
  generateDownloadTokenController,
  loginController,
} from "./controller.js";
import { validateDownloadToken } from "./middleware/validateDownloadToken.js";
import { validateMagicLinkStatus } from "./middleware/validateMagicLinkStatus.js";
import { validateSessionStatus } from "./middleware/validateSessionStatus.js";
import { applicationsSchema } from "./types/applications.js";
import { downloadHTMLSchema } from "./types/downloadHTML.js";
import { generateDownloadTokenSchema } from "./types/downloadToken.js";
import { loginSchema } from "./types/login.js";

const router = Router();

router.post(
  "/lps/login",
  lpsLoginLimiter,
  validate(loginSchema),
  loginController,
);
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
