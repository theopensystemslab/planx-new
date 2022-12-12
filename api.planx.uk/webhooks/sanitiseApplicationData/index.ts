import { Request, Response, NextFunction } from "express";

import { getOperations, operationHandler } from "./operations";
import { OperationResult } from "./types";

/**
 * Called by Hasura cron job `sanitise_application_data` on a nightly basis
 * See hasura.planx.uk/metadata/cron_triggers.yaml
 */
export const sanitiseApplicationData = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const operations = getOperations();
  let results: OperationResult[] = [];
  try {
    results = await Promise.all(operations.map(operationHandler));
  } catch (error) {
    // Unhandled error, flag with Airbrake
    return next({
      error,
      message: `Failed to sanitise application data. ${(error as Error).message}`,
    });
  }
  const operationFailed = results.find(result => result.status === "failure");
  if (operationFailed) res.status(500)
  // TODO: Slack notification to internal channel?
  return res.json(results);
};