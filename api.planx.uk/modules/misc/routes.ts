import { validate } from "./../../shared/middleware/validate";
import { Router } from "express";
import { useLoginAuth } from "../auth/middleware";
import {
  downloadApplicationController,
  downloadApplicationSchema,
  getLoggedInUserDetails,
  healthCheck,
} from "./controller";

const router = Router();

router.get("/", healthCheck);
router.get("/me", useLoginAuth, getLoggedInUserDetails);
router.post(
  "/download-application",
  validate(downloadApplicationSchema),
  downloadApplicationController,
);

export default router;
