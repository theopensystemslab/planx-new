import { gql } from "graphql-request";
import { subMonths } from "date-fns";

import { Operation, OperationResult } from "./types";
import { adminGraphQLClient } from "../../hasura";

const RETENTION_PERIOD_MONTHS = 6;
const REDACTED = "**REDACTED**";
export const getRetentionPeriod = () => subMonths(new Date(), RETENTION_PERIOD_MONTHS);

/**
 * List of data sanitation operations
 * XXX: Analytics logs do not contain application data
 */
 export const getOperations = (): Operation[] => ([
  // Raw application data
  sanitiseLowcalSessions,

  // Audit records
  sanitiseSessionBackups,
  sanitiseUniformApplications,
  sanitiseBOPSApplications,
  sanitiseReconciliationRequests,

  // Event logs
  // deleteHasuraEventLogs,
]);

export const operationHandler = async (operation: Operation): Promise<OperationResult> => {
  let operationResult: OperationResult = {
    operationName: operation.name,
    result: "failure"
  };

  try {
    const result = await operation()
    operationResult = {
      ...operationResult,
      result: "success",
      deleteCount: result.length,
    };
  } catch (error) {
    operationResult = {
      ...operationResult,
      errorMessage: (error as Error).message,
    }
  };

  return operationResult;
}

export const sanitiseLowcalSessions: Operation = async () => {
  const mutation = gql`
    mutation SanitiseLowcalSessions($retentionPeriod: timestamptz, $REDACTED: String) {
      update_lowcal_sessions(
        _set: { 
          data: {}
          email: $REDACTED
          sanitised_at: "now()"
        }
        where: {
          sanitised_at: { _is_null: true }
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
  const { update_lowcal_sessions: {
    returning: result
  } } = await adminGraphQLClient.request(
    mutation,
    { retentionPeriod: getRetentionPeriod(), REDACTED },
  );
  return result;
};

export const sanitiseSessionBackups: Operation = async () => {
  const mutation = gql`
    mutation SanitiseSessionBackups($retentionPeriod: timestamptz) {
      update_session_backups(
        _set: {
          flow_data: null
          user_data: null
          sanitised_at: "now()"
        }
        where: {
          sanitised_at: { _is_null: true }
          # TODO: Setup foreign key and use lowcal_session dates?
          created_at: { _lt: $retentionPeriod }
        }
      ) {
        returning {
          id
        }
      } 
    }
  `;
  const { update_session_backups: {
    returning: result
  } } = await adminGraphQLClient.request(
    mutation,
    { retentionPeriod: getRetentionPeriod() },
  );
  return result;
};

export const sanitiseUniformApplications: Operation = async () => {
  const mutation = gql`
    mutation SanitiseUniformApplications($retentionPeriod: timestamptz) {
      update_uniform_applications(
        _set: { 
          payload: null
          sanitised_at: "now()"
        }
        where: {
          sanitised_at: { _is_null: true }
          created_at: { _lt: $retentionPeriod }
        }
      ) {
        returning {
          id
        }
      } 
    }
  `;
  const { update_uniform_applications: {
    returning: result
  } } = await adminGraphQLClient.request(
    mutation,
    { retentionPeriod: getRetentionPeriod() },
  );
  return result;
};

export const sanitiseBOPSApplications: Operation = async () => {
  const mutation = gql`
    mutation SanitiseBOPSApplications($retentionPeriod: timestamptz) {
      update_bops_applications(
        _set: { 
          request: {}
          sanitised_at: "now()"
        }
        where: {
          sanitised_at: { _is_null: true }
          created_at: { _lt: $retentionPeriod }
        }
      ) {
        returning {
          id
        }
      } 
    }
  `;
  const { update_bops_applications: {
    returning: result
  } } = await adminGraphQLClient.request(
    mutation,
    { retentionPeriod: getRetentionPeriod() },
  );
  return result;
};

export const sanitiseReconciliationRequests: Operation = async () => {
  const mutation = gql`
    mutation SanitiseReconciliationRequests($retentionPeriod: timestamptz) {
      update_reconciliation_requests(
        _set: { 
          response: null
          sanitised_at: "now()"
        }
        where: {
          sanitised_at: { _is_null: true }
          created_at: { _lt: $retentionPeriod }
        }
      ) {
        returning {
          id
        }
      } 
    }
  `;
  const { update_reconciliation_requests: {
    returning: result
  } } = await adminGraphQLClient.request(
    mutation,
    { retentionPeriod: getRetentionPeriod() },
  );
  return result;
};

// export const deleteHasuraEventLogs: Operation = async () => {
  // https://hasura.io/docs/latest/api-reference/schema-api/run-sql/
  // https://hasura.io/docs/latest/event-triggers/clean-up/
// };