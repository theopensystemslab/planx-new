import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";

// Broad limiter to prevent egregious abuse
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request, _res: Response) => {
    // add a mechanism for skipping rate limit when load testing (on local or staging only)
    if (process.env.APP_ENVIRONMENT == "production") return false;
    const rateLimitHeader = req.get("X-Skip-Rate-Limit-Secret");
    const SKIP_RATE_LIMIT_SECRET = process.env?.SKIP_RATE_LIMIT_SECRET;
    if (
      rateLimitHeader &&
      SKIP_RATE_LIMIT_SECRET &&
      rateLimitHeader === SKIP_RATE_LIMIT_SECRET
    )
      return true;
    return false;
  },
});

const HASURA_ONLY_SEND_EMAIL_TEMPLATES = ["reminder", "expiry"];

// Limit the number of requests which can send a "Save & Return" email
const sendEmailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 10 minutes
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  // Use email as key for limiter
  // Invalid emails will fail at validation
  keyGenerator: (req: Request, _res: Response) => req.body?.payload?.email,
  // Only apply limiter to public requests - allow Hasura to make multiple requests without limit
  // Any other S&R endpoints require authorisation
  skip: (req: Request, _res: Response) =>
    HASURA_ONLY_SEND_EMAIL_TEMPLATES.includes(req.params.template),
});

export { apiLimiter, sendEmailLimiter };
