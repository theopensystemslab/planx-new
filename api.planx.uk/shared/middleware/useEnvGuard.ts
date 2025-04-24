import type { RequestHandler } from "express";

type Environment = "development" | "test" | "pizza" | "staging" | "production";

type UseEnvGuard = (envs: Environment[]) => RequestHandler;

/**
 * Only allow access to the listed environments
 */
export const useEnvGuard: UseEnvGuard = (envs) => async (_req, res, next) => {
  const currentEnv = process.env.APP_ENVIRONMENT as Environment;
  const isBlocked = !envs.includes(currentEnv);
  // if (isBlocked) return res.status(200).json({ error: `Operation not permitted on the ${currentEnv} environment`});
  if (isBlocked) return res.status(403).send();

  return next();
};
