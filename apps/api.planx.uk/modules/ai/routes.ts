import { Router } from "express";

import { aiLimiter } from "../../rateLimit.js";
import { validate } from "../../shared/middleware/validate.js";
import { projectDescriptionController } from "./projectDescription/controller.js";
import { projectDescriptionSchema } from "./projectDescription/types.js";
import { applyDefaultModel } from "./middleware/applyDefaultModel.js";
import { detectPromptInjection } from "./middleware/detectPromptInjection.js";
import { redactPii } from "./middleware/redactPii.js";
import { sanitiseInput } from "./middleware/sanitiseInput.js";

const router = Router();

// we apply a stricter rate limit to the below /ai routes
router.use("/ai", aiLimiter);

// TODO: optionally accept sessionId, flowId in the post data
router.post(
  "/ai/project-description/enhance",
  // for the moment, rather than accept a model ID in the request, we enforce a default
  applyDefaultModel,
  validate(projectDescriptionSchema),
  // we implement some basic deterministic 'guardrails' before sending user input to (third-party) LLM
  // XXX: if we find these to be insufficient, consider a solution based on AWS Bedrock (or similar)
  detectPromptInjection("original"),
  sanitiseInput("original"),
  redactPii("original"),
  projectDescriptionController,
);

export default router;
