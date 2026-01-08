import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { schema as projectDescriptionSchema } from "./projectDescription/types.js";
import { projectDescriptionController } from "./projectDescription/controller.js";
import { aiLimiter } from "../../rateLimit.js";
import { sanitiseInput } from "./middleware/sanitiseInput.js";
import { detectPromptInjection } from "./middleware/detectPromptInjection.js";
import { redactPii } from "./middleware/redactPii.js";

const router = Router();
router.use(aiLimiter);

router.post(
  "/project-description/enhance",
  validate(projectDescriptionSchema),
  // we implement some basic deterministic 'guardrails' before sending user input to (third-party) LLM
  // XXX: if we find these to be insufficient, consider a solution based on AWS Bedrock (or similar)
  sanitiseInput("original"),
  detectPromptInjection("original"),
  redactPii("original"),
  projectDescriptionController,
);

export default router;
