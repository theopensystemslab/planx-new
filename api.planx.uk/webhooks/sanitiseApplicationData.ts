import { subMonths } from "date-fns";
import { Request, Response, NextFunction } from "express";
import { gql } from "graphql-request";

import { adminGraphQLClient } from "../hasura";

interface OperationResult {
  operationName: string;
  result: "success" | "failure";
  deleteCount?: number;
  errorMessage?: string;
};

interface QueryResult {
  returning: [
    id: string
  ]
};

type Operation = () => Promise<QueryResult>;

const RETENTION_PERIOD_MONTHS = 6;
const REDACTED = "**REDACTED**";
const getRetentionPeriod = () => subMonths(new Date(), RETENTION_PERIOD_MONTHS);

// TODO: sanitised_at or deleted_at column on all tables?

/**
 * Called by Hasura cron job `sanitise_applicant_data` on a nightly basis
 * See hasura.planx.uk/metadata/cron_triggers.yaml
 */
const sanitiseApplicationData = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const operations = [
    // Raw application data
    sanitiseLowcalSessions,

    // // Audit records
    // deleteSessionBackups,
    // deleteUniformApplications,
    // deleteBopsApplications,
    // deleteReconciliationRequests,

    // // Event logs
    // deleteHasuraEventLogs,
  ];
  let results: OperationResult[] = [];
  try {
    results = await Promise.all(operations.map(operationHandler));
  } catch (error) {
    // Uncaught error, flag with Airbrake
    return next({
      error,
      message: `Failed to sanitise application data. ${(error as Error).message}`,
    });
  }
  const operationFailed = results.find(operation => operation.result === "failure");
  if (operationFailed) res.status(500)
  // TODO: Slack notification
  res.json(results);
};

const operationHandler = async (operation: Operation): Promise<OperationResult> => {
  let operationResult: OperationResult = {
    operationName: operation.name,
    result: "failure"
  };

  try {
    const result = await operation()
    operationResult = {
      ...operationResult,
      result: "success",
      deleteCount: result.returning.length,
    };
  } catch (error) {
    operationResult = {
      ...operationResult,
      errorMessage: (error as Error).message,
    }
  };

  return operationResult;
}

const sanitiseLowcalSessions: Operation = async () => {
  const mutation = gql`
    mutation SanitiseLowcalSessions($retentionPeriod: timestamptz, $REDACTED: String) {
      update_lowcal_sessions(
        _set: { data: {} , email: $REDACTED }
        where: {
          _or: [
            { deleted_at: { _lt: $retentionPeriod } }
            { submitted_at: { _lt: $retentionPeriod } }
          ]
        }
      ) {
        returning {
          id
        }
      }
    }
  `;
  const { update_lowcal_sessions: queryResult } = await adminGraphQLClient.request(
    mutation,
    { retentionPeriod: getRetentionPeriod(), REDACTED }
  );
  return queryResult;
};

// const deleteSessionBackups: Operation = async (retentionPeriod) => {
//   const mutation = gql`
//     mutation DeleteSessionBackups($retentionPeriod: timestamptz) {
//       delete_session_backups(
//         where: {
//           _or: [
//             { deleted_at: { _lt: $retentionPeriod } }
//             { submitted_at: { _lt: $retentionPeriod } }
//           ]
//         }
//       ) {
//         returning {
//           id
//         }
//       }
//     }
//   `;
//   try {
//     const { delete_session_backups } = await adminGraphQLClient.request(
//       mutation,
//       { retentionPeriod }
//     );
//   } catch (error) {

//   }

// };

// const deleteUniformApplications: Operation = async (retentionPeriod) => {

// };

// const deleteBopsApplications: Operation = async (retentionPeriod) => {

// };

// const deleteHasuraEventLogs: Operation = async (retentionPeriod) => {

// };

// const deleteReconciliationRequests: Operation = async (retentionPeriod) => {

// };

export { sanitiseApplicationData };