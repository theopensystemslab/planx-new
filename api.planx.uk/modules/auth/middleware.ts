import crypto from "crypto";
import assert from "assert";
import { ServerError } from "../../errors";
import { Template } from "../../lib/notify";
import { expressjwt } from "express-jwt";

import passport from "passport";

import { RequestHandler } from "http-proxy-middleware";
import { Role } from "@opensystemslab/planx-core/types";
import { AsyncLocalStorage } from "async_hooks";
import { Request } from "express";

export const userContext = new AsyncLocalStorage<{ user: Express.User }>();

/**
 * Validate that a provided string (e.g. API key) matches the expected value
 */
export const isEqual = (provided = "", expected: string): boolean => {
  // Reject test against falsey values - could indicate unset secret
  if (!expected) return false;

  const hash = crypto.createHash("SHA512");
  return crypto.timingSafeEqual(
    hash.copy().update(provided).digest(),
    hash.copy().update(expected).digest(),
  );
};

/**
 * Validate that a request is using the Hasura API key
 */
export const useHasuraAuth: RequestHandler = (req, _res, next): void => {
  const isAuthenticated = isEqual(
    req.headers.authorization,
    process.env.HASURA_PLANX_API_KEY!,
  );
  if (!isAuthenticated) return next({ status: 401, message: "Unauthorised" });
  return next();
};

/**
 * Ensure that the correct permissions are used for the /send-email endpoint
 */
export const useSendEmailAuth: RequestHandler = (req, res, next): void => {
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
export const useFilePermission: RequestHandler = (req, _res, next): void => {
  const isAuthenticated =
    isEqual(req.headers["api-key"] as string, process.env.FILE_API_KEY!) ||
    isEqual(req.headers["api-key"] as string, process.env.FILE_API_KEY_NEXUS!);
  if (!isAuthenticated) return next({ status: 401, message: "Unauthorised" });
  return next();
};

export const getToken = (req: Request) =>
  req.cookies?.jwt ??
  req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1] ??
  req.query?.token;

// XXX: Currently not checking for JWT and including req.user in every
//      express endpoint because authentication also uses req.user. More info:
//      https://github.com/theopensystemslab/planx-new/pull/555#issue-684435760
// TODO: requestProperty can now be set. This might resolve the above issue.
export const useJWT = expressjwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ["HS256"],
  credentialsRequired: true,
  requestProperty: "user",
  getToken: getToken,
});

export const useGoogleAuth: RequestHandler = (req, res, next) => {
  req.session!.returnTo = req.get("Referrer");
  return passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

export const useGoogleCallbackAuth: RequestHandler = (req, res, next) => {
  return passport.authenticate("google", {
    failureRedirect: "/auth/login/failed",
  })(req, res, next);
};

type UseRoleAuth = (authRoles: Role[]) => RequestHandler;

/**
 * Validate that an incoming request is using the role required for an endpoint
 * Wrapped by the useJWT middleware to ensure token is valid, available, and decoded
 *
 * This does not check if a user can ultimately access a resource, only that they can access this route
 * Hasura will validate this on a row and column basis when the query or mutation is made
 */
export const useRoleAuth: UseRoleAuth =
  (authRoles) => async (req, res, next) => {
    useJWT(req, res, () => {
      if (!req?.user)
        return next({
          status: 401,
          message: "No authorization token was found",
        });

      const userRoles =
        req.user["https://hasura.io/jwt/claims"]?.["x-hasura-allowed-roles"];
      if (!userRoles)
        return next({
          status: 401,
          message: "User roles missing from token",
        });

      const userId = req.user.sub;
      // Check if a user has any of the roles required for this route
      const isAuthorised = userRoles.some((role) => authRoles.includes(role));

      if (!isAuthorised) {
        console.error(
          `Authentication error: User ${userId} does have have any of the roles [${authRoles.join(
            ", ",
          )}] which are required to access ${req.path}`,
        );
        return next({
          status: 403,
          message: "Access denied",
        });
      }

      // Establish a context for the current request/response call stack using AsyncLocalStorage
      // The validated user will be accessible to all subsequent functions
      // Store the raw JWT to pass on to plan-core client
      userContext.run(
        {
          user: {
            ...req.user,
            jwt: getToken(req),
          },
        },
        () => next(),
      );
    });
  };

// Convenience methods for role-based access
export const useTeamViewerAuth = useRoleAuth([
  "teamViewer",
  "teamEditor",
  "platformAdmin",
]);
export const useTeamEditorAuth = useRoleAuth(["teamEditor", "platformAdmin"]);
export const usePlatformAdminAuth = useRoleAuth(["platformAdmin"]);

/**
 * Allow any logged in user to access route, without checking roles
 */
export const useLoginAuth: RequestHandler = (req, res, next) =>
  useJWT(req, res, () => {
    if (req?.user?.sub) {
      userContext.run(
        {
          user: {
            ...req.user,
            jwt: getToken(req),
          },
        },
        () => next(),
      );
    } else {
      return next({
        status: 401,
        message: "No authorization token was found",
      });
    }
  });

export const useNoCache: RequestHandler = (_req, res, next) => {
  res.setHeader("Surrogate-Control", "no-store");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.setHeader("Expires", "0");
  next();
};
