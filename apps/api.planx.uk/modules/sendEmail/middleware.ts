import type { RequestHandler } from "express";

/**
 * Env guard for the Resend "welcome" email template
 *
 * Welcome emails should only be sent in production (and test).
 * These are triggered by INSERT to the users table which happends often
 * in non-production envs (on each data-sync operation).
 *
 * Returns 200 so the triggering Hasura event does not fail and retry
 */
export const useWelcomeEmailGuard: RequestHandler = (_req, res, next): void => {
  const isAllowed = ["production", "test"].includes(
    process.env.APP_ENVIRONMENT!,
  );

  if (!isAllowed) {
    res.status(200).send({
      message:
        "Skipping welcome email: APP_ENVIRONMENT is not production or test",
    });
    return;
  }

  next();
};
