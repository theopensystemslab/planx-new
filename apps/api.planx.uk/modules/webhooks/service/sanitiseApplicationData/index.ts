import { getFormattedEnvironment } from "../../../../helpers.js";
import { sendSlackMessage } from "../../../slack/utils.js";
import {
  operationHandler,
  sanitiseAuditRecordsOperations,
  sanitiseFeedbackOperations,
  sanitiseHasuraEventsOperations,
  sanitiseRawApplicationDataOperations,
} from "./operations.js";
import type { Operation, OperationResult } from "./types.js";

/**
 * Called by Hasura cron jobs on a nightly basis
 * See apps/hasura.planx.uk/metadata/cron_triggers.yaml
 */

const createOperationsHelper = async (
  operations: Operation[],
  sanitationType: string,
) => {
  const results: OperationResult[] = [];

  for (const operation of operations) {
    const result = await operationHandler(operation);
    results.push(result);
  }
  const operationFailed = results.some((result) => result.status === "failure");
  if (operationFailed)
    await postToSlack(results, `${sanitationType} Data Sanitation`);

  return { operationFailed, results };
};

export const sanitiseRawApplicationData = async () => {
  const results = await createOperationsHelper(
    sanitiseRawApplicationDataOperations(),
    "Raw Application",
  );
  return results;
};

export const sanitiseAuditRecordsData = async () => {
  const results = await createOperationsHelper(
    sanitiseAuditRecordsOperations(),
    "Audit Records",
  );
  return results;
};

export const sanitiseHasuraEventsData = async () => {
  const results = await createOperationsHelper(
    sanitiseHasuraEventsOperations(),
    "Hasura Events and Logs",
  );
  return results;
};

export const sanitiseFeedbackData = async () => {
  const results = await createOperationsHelper(
    sanitiseFeedbackOperations(),
    "Feedback",
  );
  return results;
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
