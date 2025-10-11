import { validate } from "./../../shared/middleware/validate.js";
import { Router } from "express";
import {
  downloadApplicationController,
  downloadApplicationSchema,
  healthCheck,
} from "./controller.js";

const router = Router();

router.get("/", healthCheck);
router.post(
  "/download-application",
  validate(downloadApplicationSchema),
  downloadApplicationController,
);

export default router;
