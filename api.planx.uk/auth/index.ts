import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import assert from "assert";
import { ServerError } from "../errors";
import { Template } from "../notify";

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
  const handleInvalidTemplate = (_template?: never) => {
    throw new ServerError({
      message: "Invalid template",
      status: 400,
    });
  };
  const template: Template = req.params.template as Template;
  switch (template) {
    // Requires authorization - can only be triggered by Hasura scheduled events
    case "reminder":
    case "expiry":
    case "confirmation":
    case "invite-to-pay":
    case "invite-to-pay-agent":
    case "payment-reminder":
    case "payment-reminder-agent":
    case "payment-expiry":
    case "payment-expiry-agent":
    case "confirmation-agent":
    case "confirmation-payee":
      return useHasuraAuth(req, res, next);
    // Public access
    case "save":
      return next();
    // Handled by other routes
    case "submit":
    case "resume":
      return next();
    default: {
      return handleInvalidTemplate(template);
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
    process.env.FILE_API_KEY!
  );
  if (!isAuthenticated) return next({ status: 401, message: "Unauthorised" });
  return next();
};

export { useHasuraAuth, useSendEmailAuth, useFilePermission };
