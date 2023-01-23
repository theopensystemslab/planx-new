import { gql } from "graphql-request";
import { subMonths } from "date-fns";

import { Operation, OperationResult } from "./types";
import { adminGraphQLClient } from "../../hasura";
import { runSQL } from "../../hasura/schema";

const RETENTION_PERIOD_MONTHS = 6;
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
  deleteReconciliationRequests,

  // Event logs
  deleteHasuraEventLogs,
]);

export const operationHandler = async (operation: Operation): Promise<OperationResult> => {
  let operationResult: OperationResult = {
    operationName: operation.name,
    status: "processing"
  };

  try {
    const result = await operation()
    operationResult = {
      ...operationResult,
      status: "success",
      count: result.length,
    };
  } catch (error) {
    operationResult = {
      ...operationResult,
      status: "failure",
      errorMessage: (error as Error).message,
    }
  };

  return operationResult;
}

export const sanitiseLowcalSessions: Operation = async () => {
  const mutation = gql`
    mutation SanitiseLowcalSessions($retentionPeriod: timestamptz) {
      update_lowcal_sessions(
        _set: { 
          data: {}
          email: ""
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
    { retentionPeriod: getRetentionPeriod() },
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

export const deleteReconciliationRequests: Operation = async () => {
  const mutation = gql`
    mutation DeleteReconciliationRequests($retentionPeriod: timestamptz) {
      delete_reconciliation_requests(
        where: {
          created_at: { _lt: $retentionPeriod }
        }
      ) {
        returning {
          id
        }
      } 
    }
  `;
  const { delete_reconciliation_requests: {
    returning: result
  } } = await adminGraphQLClient.request(
    mutation,
    { retentionPeriod: getRetentionPeriod() },
  );
  return result;
};

/**
 * Call Hasura Schema API to delete logs
 * Docs: https://hasura.io/docs/latest/event-triggers/clean-up/
 */
export const deleteHasuraEventLogs: Operation = async () => {
  const response = await runSQL(`
    DELETE FROM hdb_catalog.event_invocation_logs
    WHERE created_at < now() - interval '6 months';
    
    DELETE FROM hdb_catalog.event_log
    WHERE (delivered = true OR error = true)
    AND created_at < now() - interval '6 months'
    RETURNING id;
  `);
  const [ _column_name, ...ids] = response.result.flat()
  return ids;
};