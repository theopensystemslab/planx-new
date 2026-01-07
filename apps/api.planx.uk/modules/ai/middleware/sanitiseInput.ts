import type { NextFunction, Request, Response } from "express";

export const sanitiseInput =
  (key: string) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = res.locals.parsedReq.body[key];

      // remove control characters except tab, newline and carriage return
      // eslint-disable-next-line no-control-regex
      let sanitised = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

      // normalise whitespace - replace multiple spaces/tabs with single space
      sanitised = sanitised.replace(/[ \t]+/g, " ");

      // normalise line breaks - replace multiple newlines with maximum of 2
      sanitised = sanitised.replace(/\n{3,}/g, "\n\n");

      // trim leading/trailing whitespace
      sanitised = sanitised.trim();

      // strip potential delimiter/escape characters that could break LLM context
      // remove XML-like tags that could interfere with our structured prompts
      sanitised = sanitised.replace(/<\/?[^>]+(>|$)/g, "");

      // update the parsed request body with sanitised input
      res.locals.parsedReq.body[key] = sanitised;

      next();
    } catch (error) {
      return res.status(500).json({
        error: "SANITISATION_ERROR",
        message: "Failed to sanitise input",
      });
    }
  };
