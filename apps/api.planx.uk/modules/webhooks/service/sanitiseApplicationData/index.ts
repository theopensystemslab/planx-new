import { getFormattedEnvironment } from "../../../../helpers.js";
import { sendSlackMessage } from "../../../slack/utils.js";
import type { OperationResult } from "../../types.js";
import { getOperations, operationHandler } from "./operations.js";

/**
 * Called by Hasura cron job `sanitise_application_data` on a nightly basis
 * See apps/hasura.planx.uk/metadata/cron_triggers.yaml
 */
export const sanitiseApplicationData = async () => {
  const operations = getOperations();
  const results: OperationResult[] = [];

  for (const operation of operations) {
    const result = await operationHandler(operation);
    results.push(result);
  }

  const failedOperations = results.filter(
    (result) => result.status === "failure",
  );
  const operationFailed = failedOperations.length > 0;

  if (operationFailed) {
    const failedOperationNames = failedOperations.map(
      (result) => result.operationName,
    );
    console.error(
      `Data Sanitation failed for: ${failedOperationNames.join(", ")}`,
    );
    await postToSlack(results, "Data Sanitation");
  } else {
    const succeededOperationNames = results.map(
      (result) => result.operationName,
    );
    console.log(
      `Data Sanitation succeeded for: ${succeededOperationNames.join(", ")}`,
    );
  }

  return { operationFailed, results };
};

export const postToSlack = async (
  results: OperationResult[],
  jobName: string,
) => {
  const text = results.map((result) =>
    result.status === "failure"
      ? `:x: ${result.operationName} failed. Error: ${result.errorMessage}`
      : `:white_check_mark: ${result.operationName} succeeded`,
  );
  const env = getFormattedEnvironment();

  await sendSlackMessage({
    channel: "#planx-notifications-internal",
    text: text.join("\n"),
    username: `${jobName} Cron Job (${env})`,
  });
};
