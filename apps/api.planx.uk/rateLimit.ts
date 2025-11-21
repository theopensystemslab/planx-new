import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

const isTestEnv = () =>
  ["test", "development"].includes(process.env.APP_ENVIRONMENT!);

/**
 * Broad limiter to prevent egregious abuse
 */
const apiLimiter = rateLimit({
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "[API limiter]: Too many requests, please try again",
  },
  windowMs: TEN_MINUTES_IN_MS,
  max: 2500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request, _res: Response) => {
    // Don't rate limit tests which intentionally trigger a large number of requests
    if (isTestEnv()) return true;

    // add a mechanism (guarded by a secret) for skipping rate limit when load testing
    return (
      req.get("X-Skip-Rate-Limit-Secret") === process.env.SKIP_RATE_LIMIT_SECRET
    );
  },
});

const HASURA_ONLY_SEND_EMAIL_TEMPLATES = ["reminder", "expiry"];

/**
 * Limit the number of requests which can send a "Save & Return" email
 */
const sendEmailLimiter = rateLimit({
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "[SendEmail limiter]: Too many requests, please try again",
  },
  windowMs: FIVE_MINUTES_IN_MS,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  // Use email as key for limiter
  // Invalid emails will fail at validation
  keyGenerator: (req: Request, _res: Response) => req.body?.payload?.email,
  skip: (req: Request, _res: Response) => {
    if (isTestEnv()) return true;
    // Only apply limiter to public requests - allow Hasura to make multiple requests without limit
    // Any other S&R endpoints require authorisation
    return HASURA_ONLY_SEND_EMAIL_TEMPLATES.includes(req.params.template);
  },
});

/**
 * Very strict limiter for AI powered endpoints
 */
const aiLimiter = rateLimit({
  message: {
    error: "TOO_MANY_REQUESTS",
    message: "[AI limiter]: Too many requests, please try again",
  },
  windowMs: TEN_MINUTES_IN_MS,
  // Higher limit in testing environments
  max: isTestEnv() ? 100 : 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export { apiLimiter, sendEmailLimiter, aiLimiter };
