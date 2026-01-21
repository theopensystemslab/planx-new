import { Router } from "express";

import { aiLimiter } from "../../rateLimit.js";
import { validate } from "../../shared/middleware/validate.js";
import { projectDescriptionController } from "./projectDescription/controller.js";
import { projectDescriptionSchema } from "./projectDescription/types.js";
import { validateModel } from "./middleware/validateModel.js";
import { detectPromptInjection } from "./middleware/detectPromptInjection.js";
import { redactPii } from "./middleware/redactPii.js";
import { sanitiseInput } from "./middleware/sanitiseInput.js";

const router = Router();

// we apply a stricter rate limit to the below /ai routes
router.use("/ai", aiLimiter);

// we implement some basic deterministic 'guardrails' before sending user input to (third-party) LLM
// XXX: if we find these to be insufficient, consider a solution based on AWS Bedrock (or similar)
router.post(
  "/ai/project-description/enhance",
  // we validate the model supplied (or enforce a default if none given) before parsing the request body
  validateModel,
  validate(projectDescriptionSchema),
  detectPromptInjection("original"),
  sanitiseInput("original"),
  redactPii("original"),
  projectDescriptionController,
);

export default router;
