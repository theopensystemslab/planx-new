import type { NextFunction, Request, Response } from "express";

// NB. we don't attempt to catch prompt injection attacks based on natural language with regex
const INJECTION_PATTERNS = [
  // control tokens/delimiters
  /system:/i,
  /assistant:/i,
  /user:/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,

  // delimiter breaking
  /<\/user_input>/,
  /```/,

  // excessive repetition
  /(.)\1{20,}/,
];
const SPECIAL_CHAR_RATIO_THRESHOLD = 0.25; // 25%

export const detectPromptInjection =
  (key: string) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = res.locals.parsedReq.body[key];

      // check for one of our known injection patterns
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(input)) {
          console.warn(
            `Suspicious input detected - common prompt injection pattern: ${pattern}`,
          );
          return res.status(400).json({
            error: "INVALID_INPUT",
            message:
              "The input contains patterns that do not seem appropriate.",
          });
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
        console.warn(
          `Suspicious input detected - high ratio of special characters: (${specialCharCount}/${totalLength})`,
        );
        return res.status(400).json({
          error: "INVALID_INPUT",
          message:
            "The input contains an unusually high ratio of special characters.",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: "VALIDATION_ERROR",
        message: "Failed to validate input",
      });
    }
  };
