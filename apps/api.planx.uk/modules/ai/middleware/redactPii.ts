import type { NextFunction, Request, Response } from "express";

import { ServerError } from "../../../errors/index.js";

// patterns for UK-specific personally identifiable information (PII) we might see in user inputs
// we lean towards permissive patterns to reduce misses, possibly at the cost of a few false positives
// we don't currently attempt to redact names and phone numbers because the patterns are too broad
const PII_PATTERNS = {
  // general email pattern from HTML5 spec
  // see: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
  email:
    /\b[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\b/gi,

  // UK National Insurance Number
  // see: https://owasp.org/www-community/OWASP_Validation_Regex_Repository
  nino: /\b[A-Z]{2}\s?(?:\d\d\s?){3}\s?[A-Z]\b/gi,

  // UK house number with street name
  address:
    /\b\d{1,4}[a-z]?\s(?:[a-z]+\s){1,2}(street|road|lane|avenue|drive|close|way|court|place|crescent|terrace|square|gardens|hill)\b/gi,

  // UK postcodes
  // see: https://stackoverflow.com/questions/164979/regex-for-matching-uk-postcodes
  postcode: /\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/gi,
};

export const redactPii =
  (key: string) => (_req: Request, res: Response, next: NextFunction) => {
    try {
      let input = res.locals.parsedReq.body[key];
      let piiDetected = false;
      const detectedTypes: string[] = [];

      for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
        if (pattern.test(input)) {
          const redactionRef = type.toUpperCase();
          input = input.replace(pattern, `[${redactionRef}]`);
          detectedTypes.push(redactionRef);
          piiDetected = true;
          pattern.lastIndex = 0; // reset regex state
        }
      }

      if (piiDetected) {
        console.debug(
          `The following types of PII were detected and redacted: ${detectedTypes.join(", ")}`,
        );
        // store original and redacted versions, but send only the latter to the LLM
        res.locals.redactedInput = input;
        res.locals.originalInput = res.locals.parsedReq.body[key];
        res.locals.parsedReq.body[key] = input;
      }

      next();
    } catch (error) {
      console.error("Error in PII detection middleware:", error);
      next(
        new ServerError({
          message: `Failed to redact any personally identifiable information found in input`,
        }),
      );
    }
  };
