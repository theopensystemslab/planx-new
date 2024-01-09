import { postToSlack } from "../sanitiseApplicationData";
import { operationHandler } from "../sanitiseApplicationData/operations";
import { OperationResult } from "../sanitiseApplicationData/types";
import { getAnalyzeSessionOperations } from "./operations";

/**
 * Called by Hasura cron job `analyze_sessions` on a nightly basis
 * See hasura.planx.uk/metadata/cron_triggers.yaml
 */
export const analyzeSessions = async () => {
  const operations = getAnalyzeSessionOperations();
  const results: OperationResult[] = [];

  for (const operation of operations) {
    const result = await operationHandler(operation);
    results.push(result);
  }

  const operationFailed = results.some((result) => result.status === "failure");
  if (operationFailed) await postToSlack(results, "Sesssion Analytics");

  return { operationFailed, results };
};
