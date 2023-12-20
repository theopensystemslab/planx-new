import { validate } from "./../../shared/middleware/validate";
import { Router } from "express";
import {
  downloadApplicationController,
  downloadApplicationSchema,
  healthCheck,
} from "./controller";

const router = Router();

router.get("/", healthCheck);
router.post(
  "/download-application",
  validate(downloadApplicationSchema),
  downloadApplicationController,
);

export default router;
