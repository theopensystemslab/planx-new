import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { schema as projectDescriptionSchema } from "./projectDescription/types.js";
import { projectDescriptionController } from "./projectDescription/controller.js";
import { aiLimiter } from "../../rateLimit.js";

const router = Router();
router.use(aiLimiter);

router.post(
  "/project-description/enhance",
  // TODO: Strict prompt validation / abuse / jailbreak checks
  validate(projectDescriptionSchema),
  projectDescriptionController,
);

export default router;
