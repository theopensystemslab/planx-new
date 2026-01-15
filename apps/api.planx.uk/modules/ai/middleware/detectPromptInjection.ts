import type { NextFunction, Request, Response } from "express";

import { GUARDRAIL_REJECTION_REASON } from "../types.js";
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

      // check for one of our known injection patterns
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(input)) {
          const msg = `Suspicious input detected - common prompt injection pattern: ${pattern}`;
          console.warn(msg);
          // log the rejection of the request due to guardrail tripping to audit table in db
          logAiGuardrailRejection({
            endpoint,
            modelId,
            prompt: input,
            guardrailReason: GUARDRAIL_REJECTION_REASON.PROMPT_INJECTION,
            guardrailMessage: msg,
          });
          return res
            .status(400)
            .send("The input contains patterns that do not seem appropriate.");
        }
      }

      // check for an unusually high ratio of special characters
      const specialCharCount = (input.match(/[^a-zA-Z0-9\s.,'-]/g) || [])
        .length;
      const totalLength = input.length;
      if (
        totalLength > 0 &&
        specialCharCount / totalLength > SPECIAL_CHAR_RATIO_THRESHOLD
      ) {
        const msg = `Suspicious input detected - high ratio of special characters: (${specialCharCount}/${totalLength})`;
        console.warn(msg);
        logAiGuardrailRejection({
          endpoint,
          modelId,
          prompt: input,
          guardrailReason: GUARDRAIL_REJECTION_REASON.PROMPT_INJECTION,
          guardrailMessage: msg,
        });
        return res
          .status(400)
          .send(
            "The input contains an unusually high ratio of special characters.",
          );
      }

      next();
    } catch (error) {
      console.error("Error in prompt injection detection middleware:", error);
      return res.status(500).send("Failed to validate input");
    }
  };
