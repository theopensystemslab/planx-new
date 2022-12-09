import { subMonths } from "date-fns";
import { Request, Response, NextFunction } from "express";
import { gql } from "graphql-request";

import { LowCalSession } from "./../types";
import { adminGraphQLClient } from "../hasura";

interface OperationResult {
  operationName: string;
  result: "success" | "failure";
  deleteCount: number;
  errorMessage?: string;
}

type Operation = (retentionPeriod: Date) => Promise<OperationResult>

/**
 * Called by Hasura cron job `sanitise_applicant_data` on a nightly basis
 * See hasura.planx.uk/metadata/cron_triggers.yaml
 * 
 * XXX: Analytics logs do not contain application data
 */
const sanitiseApplicationData = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const retentionPeriod = subMonths(new Date(), 6);
  try {
    const results: OperationResult[] = await Promise.all([
      // Raw application data
      deleteLowcalSessions(retentionPeriod),

      // Audit records
      deleteSessionBackups(retentionPeriod),
      deleteUniformApplications(retentionPeriod),
      deleteBopsApplications(retentionPeriod),
      deleteReconciliationRequests(retentionPeriod),

      // Event logs
      deleteHasuraEventLogs(retentionPeriod),
    ]);

    res.json(results);
  } catch (error) {
    // Skip "return" to hit finally?
    next({
      error,
      message: `Failed to delete application data. ${(error as Error).message}`,
    });
  }
  finally {
    // Slack notification to internal channel?
  }
};

const deleteSessionBackups: Operation = async (retentionPeriod) => {
  // const mutation = gql`
  //   mutation DeleteSessionBackups($retentionPeriod: timestamptz) {
  //     delete_session_backups(
  //       where: {
  //         _or: [
  //           { deleted_at: { _lt: $retentionPeriod } }
  //           { submitted_at: { _lt: $retentionPeriod } }
  //         ]
  //       }
  //     ) {
  //       returning {
  //         id
  //       }
  //     }
  //   }
  // `;
  // const { delete_session_backups } = await adminGraphQLClient.request(
  //   mutation,
  //   { retentionPeriod }
  // );
};

const deleteLowcalSessions: Operation = async (retentionPeriod) => {

};

const deleteUniformApplications: Operation = async (retentionPeriod) => {

};

const deleteBopsApplications: Operation = async (retentionPeriod) => {

};

const deleteHasuraEventLogs: Operation = async (retentionPeriod) => {

};

const deleteReconciliationRequests: Operation = async (retentionPeriod) => {

};

export { sanitiseApplicationData };