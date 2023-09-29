import SlackNotify from "slack-notify";
import { Request, Response, NextFunction } from "express";

import { getOperations, operationHandler } from "./operations";
import { OperationResult } from "./types";
import { getFormattedEnvironment } from "../../../../helpers";

/**
 * Called by Hasura cron job `sanitise_application_data` on a nightly basis
 * See hasura.planx.uk/metadata/cron_triggers.yaml
 */
export const sanitiseApplicationData = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const operations = getOperations();
  const results: OperationResult[] = [];
  try {
    for (const operation of operations) {
      const result = await operationHandler(operation);
      results.push(result);
    }
  } catch (error) {
    // Unhandled error, flag with Airbrake
    return next({
      error,
      message: `Failed to sanitise application data. ${
        (error as Error).message
      }`,
    });
  }

  const operationFailed = results.find((result) => result.status === "failure");
  if (operationFailed) {
    await postToSlack(results);
    res.status(500);
  }

  return res.json(results);
};

export const postToSlack = async (results: OperationResult[]) => {
  const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
  const text = results.map((result) =>
    result.status === "failure"
      ? `:x: ${result.operationName} failed. Error: ${result.errorMessage}`
      : `:white_check_mark: ${result.operationName} succeeded`,
  );
  const env = getFormattedEnvironment();

  await slack.send({
    channel: "#planx-notifications-internal",
    text: text.join("\n"),
    username: `Data Sanitation Cron Job (${env})`,
  });
};
