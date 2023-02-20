import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import assert from "assert";

/**
 * Validate that a provided string (e.g. API key) matches the expected value
 */
const isEqual = (provided = "", expected: string): boolean => {
  const hash = crypto.createHash("SHA512");
  return crypto.timingSafeEqual(
    hash.copy().update(provided).digest(),
    hash.copy().update(expected).digest()
  );
};

/**
 * Validate that a request is using the Hasura API key
 */
const useHasuraAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const isAuthenticated = isEqual(
    req.headers.authorization,
    process.env.HASURA_PLANX_API_KEY!
  );
  if (!isAuthenticated) return next({ status: 401, message: "Unauthorised" });
  return next();
};

/**
 * Ensure that the correct permissions are used for the /send-email endpoint
 */
const useSendEmailAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  switch (req.params.template) {
    // Requires authorization - can only be triggered by Hasura scheduled events
    case "reminder":
    case "expiry":
    case "confirmation":
      return useHasuraAuth(req, res, next);
    // Public access
    case "save":
      return next();
    default: {
      return next({
        status: 400,
        message: "Invalid template",
      });
    }
  }
};

/**
 * Validate that a request for a private file has the correct authentication
 */
assert(process.env.FILE_API_KEY, "Missing environment variable 'FILE_API_KEY'");
const useFilePermission = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const isAuthenticated = isEqual(
    req.headers["api-key"] as string,
    process.env.FILE_API_KEY!,
  );
  if (!isAuthenticated) return next({ status: 401, message: "Unauthorised" });
  return next();
};

export { useHasuraAuth, useSendEmailAuth, useFilePermission };
