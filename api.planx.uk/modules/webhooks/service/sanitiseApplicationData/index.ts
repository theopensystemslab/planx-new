import SlackNotify from "slack-notify";

import { getOperations, operationHandler } from "./operations";
import { OperationResult } from "./types";
import { getFormattedEnvironment } from "../../../../helpers";

/**
 * Called by Hasura cron job `sanitise_application_data` on a nightly basis
 * See hasura.planx.uk/metadata/cron_triggers.yaml
 */
export const sanitiseApplicationData = async () => {
  const operations = getOperations();
  const results: OperationResult[] = [];

  for (const operation of operations) {
    const result = await operationHandler(operation);
    results.push(result);
  }

  const operationFailed = results.some((result) => result.status === "failure");
  if (operationFailed) await postToSlack(results, "Data Sanitation");

  return { operationFailed, results };
};

export const postToSlack = async (results: OperationResult[], jobName: string) => {
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
    username: `${jobName} Cron Job (${env})`,
  });
};
