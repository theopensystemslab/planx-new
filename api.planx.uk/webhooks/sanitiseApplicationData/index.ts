import SlackNotify from 'slack-notify';
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
  await postToSlack(results);
  
  const operationFailed = results.find(result => result.status === "failure");
  if (operationFailed) res.status(500)
  return res.json(results);
};

const postToSlack = async (results: OperationResult[]) => {
  const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
  const text = results.map(result => result.status === "failure" 
    ? `:x: ${result.operationName} failed. Error: ${result.errorMessage}` 
    : `:white_check_mark: ${result.operationName} succeeded`)
  const environment = process.env.NODE_ENV;

  await slack.send({
    channel: "#planx-notifications-internal",
    text: text.join("\n"),
    username: `Data Sanitation Cron Job (${environment})`
  });
};
