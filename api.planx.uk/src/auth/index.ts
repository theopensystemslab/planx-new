import { Request, Response, NextFunction } from 'express';
import crypto from "crypto";
import { singleSessionEmailTemplates } from '../saveAndReturn/utils';

/**
 * Validate that a provided string (e.g. API key) matches the expected value
 */
const isEqual = (provided: string = "", expected: string): boolean => {
  const hash = crypto.createHash('SHA512');
  return crypto.timingSafeEqual(
    hash.copy().update(provided).digest(),
    hash.copy().update(expected).digest()
  );
};

/**
 * Validate that a request is using the Hasura API key
 */
const useHasuraAuth = (req: Request, _res: Response, next: NextFunction): NextFunction | void => {
  const isAuthenticated = isEqual(req.headers.authorization, process.env.HASURA_PLANX_API_KEY!);
  if (!isAuthenticated)
    return next({ status: 401, message: "Unauthorised" });
  next();
};

/**
 * Ensure that the correct permissions are used for the /send-email endpoint
 */
const useSendEmailAuth = (req: Request, res: Response, next: NextFunction): NextFunction | void => {
  switch (req.params.template) {
    case "reminder":
    case "expiry":
      // Requires authorization - can only be triggered by Hasura scheduled events
      return useHasuraAuth(req, res, next);
    case "save":
      // Public access
      return next();
    default:
      // Invalid template
      const validTemplates = Object.keys(singleSessionEmailTemplates);
      return next({
        status: 400,
        message: `Invalid template - must be one of [${validTemplates.join(', ')}]`
      });
  };
};

export {
  useHasuraAuth,
  useSendEmailAuth,
};
