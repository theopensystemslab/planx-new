import type { NextFunction, Request, Response } from "express";

import { GUARDRAIL_REJECTION_REASON, API_ERROR_STATUS } from "../types.js";
import { logAiGuardrailRejection } from "../logs.js";

// NB. we don't attempt to catch prompt injection attacks based on natural language with regex
const INJECTION_PATTERNS = [
  // control tokens/delimiters
  /system:/i,
  /assistant:/i,
  /user:/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,

  // delimiter breaking
  /<\/user_input>/i,
  /```/,

  // excessive repetition
  /(.)\1{20,}/,
];
const SPECIAL_CHAR_RATIO_THRESHOLD = 0.25; // 25%

export const detectPromptInjection =
  (key: string) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = res.locals.parsedReq.body[key];
      const modelId = res.locals.parsedReq.body.modelId;
      const endpoint = req.route.path;

      let internalMsg;
      let responseMsg;

      // check for one of our known injection patterns
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(input)) {
          internalMsg = `Suspicious input detected - common prompt injection pattern: ${pattern}`;
          responseMsg =
            "The input contains patterns that do not seem appropriate.";
          break;
        }
      }

      // check for an unusually high ratio of special characters
      if (!internalMsg) {
        const specialCharCount = (input.match(/[^a-zA-Z0-9\s.,'-]/g) || [])
          .length;
        const totalLength = input.length;
        if (
          totalLength > 0 &&
          specialCharCount / totalLength > SPECIAL_CHAR_RATIO_THRESHOLD
        ) {
          internalMsg = `Suspicious input detected - high ratio of special characters: (${specialCharCount}/${totalLength})`;
          responseMsg =
            "The input contains an unusually high ratio of special characters.";
        }
      }

      // if no issues detected, proceed
      if (!internalMsg) {
        return next();
      }

      // log the rejection of the request due to guardrail tripping on server and in db audit table
      console.warn(internalMsg);
      logAiGuardrailRejection({
        endpoint,
        modelId,
        prompt: input,
        guardrailReason: GUARDRAIL_REJECTION_REASON.PROMPT_INJECTION,
        guardrailMessage: internalMsg,
        sessionId: res.locals.parsedReq.body.sessionId,
        flowId: res.locals.parsedReq.body.flowId,
      });
      return res.status(400).json({
        error: API_ERROR_STATUS.GUARDRAIL_TRIPPED,
        message: responseMsg,
      });
    } catch (error) {
      console.error("Error in prompt injection detection middleware:", error);
      return res.status(500).json({
        error: API_ERROR_STATUS.ERROR,
        message: "Failed to validate input",
      });
    }
  };
