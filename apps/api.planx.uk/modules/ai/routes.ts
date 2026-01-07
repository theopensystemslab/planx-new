import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { schema as projectDescriptionSchema } from "./projectDescription/types.js";
import { projectDescriptionController } from "./projectDescription/controller.js";
import { aiLimiter } from "../../rateLimit.js";
import { sanitiseInput } from "./middleware/sanitiseInput.js";
import { detectPromptInjection } from "./middleware/detectPromptInjection.js";
import { redactPII } from "./middleware/redactPII.js";

const router = Router();
router.use(aiLimiter);

router.post(
  "/project-description/enhance",
  validate(projectDescriptionSchema),
  // we implement some deterministic guardrails before sending user input to (third-party) LLM
  sanitiseInput("original"),
  detectPromptInjection("original"),
  redactPII("original"),
  projectDescriptionController,
);

export default router;
