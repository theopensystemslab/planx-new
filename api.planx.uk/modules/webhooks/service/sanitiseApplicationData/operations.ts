import { gql } from "graphql-request";
import { subMonths } from "date-fns";

import type { Operation, OperationResult, QueryResult } from "./types.js";
import { runSQL } from "../../../../lib/hasura/schema/index.js";
import { deleteFilesByURL } from "../../../file/service/deleteFile.js";
import { $api } from "../../../../client/index.js";
import { Passport } from "@opensystemslab/planx-core";

const RETENTION_PERIOD_MONTHS = 6;
export const getRetentionPeriod = () =>
  subMonths(new Date(), RETENTION_PERIOD_MONTHS);

/**
 * List of data sanitation operations
 * XXX: Analytics logs do not contain application data
 */
export const getOperations = (): Operation[] => [
  // Raw application data
  deleteApplicationFiles,
  sanitiseLowcalSessions,
  deletePaymentRequests,

  // Audit records
  sanitiseUniformApplications,
  sanitiseBOPSApplications,
  sanitiseEmailApplications,
  deleteReconciliationRequests,

  // Event logs
  deleteHasuraEventLogs,

  // Queued up scheduled events (backup method to PG function/trigger)
  deleteHasuraScheduledEventsForSubmittedSessions,

  // Feedback records
  deleteFeedback,
];

export const operationHandler = async (
  operation: Operation,
): Promise<OperationResult> => {
  let operationResult: OperationResult = {
    operationName: operation.name,
    status: "processing",
  };

  try {
    const result = await operation();
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
    };
  }

  return operationResult;
};

/**
 * Return list of session IDs which are now ready for sanitation
 */
export const getExpiredSessionIds = async (): Promise<string[]> => {
  const query = gql`
    query GetExpiredSessionIds($retentionPeriod: timestamptz) {
      lowcal_sessions(
        where: {
          sanitised_at: { _is_null: true }
          _or: [
            { deleted_at: { _lt: $retentionPeriod } }
            { submitted_at: { _lt: $retentionPeriod } }
            { locked_at: { _lt: $retentionPeriod } }
          ]
        }
      ) {
        id
      }
    }
  `;
  const {
    lowcal_sessions: sessions,
  }: { lowcal_sessions: Record<"id", string>[] } = await $api.client.request(
    query,
    {
      retentionPeriod: getRetentionPeriod(),
    },
  );
  const sessionIds = sessions.map((session) => session.id);
  return sessionIds;
};

/**
 * Delete files on S3 which are associated with an application
 * This cannot currently be managed via lifecycle rules on the Bucket
 */
export const deleteApplicationFiles: Operation = async () => {
  const deletedFiles: string[] = [];

  const sessionIds = await getExpiredSessionIds();
  for (const sessionId of sessionIds) {
    const session = await $api.session.find(sessionId);
    if (!session) {
      throw Error(`Unable to find session matching id ${sessionId}`);
    }
    const files = new Passport(session.data.passport).files;
    if (files.length) {
      const fileURLs = files.map((file) => file.url);
      const deleted = await deleteFilesByURL(fileURLs);
      deletedFiles.push(...deleted);
    }
  }

  return deletedFiles;
};

type Result = { returning: QueryResult };

export const sanitiseLowcalSessions: Operation = async () => {
  const mutation = gql`
    mutation SanitiseLowcalSessions($retentionPeriod: timestamptz) {
      sessions: update_lowcal_sessions(
        _set: { data: {}, email: "", sanitised_at: "now()" }
        where: {
          sanitised_at: { _is_null: true }
          _or: [
            { deleted_at: { _lt: $retentionPeriod } }
            { submitted_at: { _lt: $retentionPeriod } }
            { locked_at: { _lt: $retentionPeriod } }
          ]
        }
      ) {
        returning {
          id
        }
      }
    }
  `;
  const {
    sessions: { returning: result },
  } = await $api.client.request<{ sessions: Result }>(mutation, {
    retentionPeriod: getRetentionPeriod(),
  });
  return result;
};

export const sanitiseUniformApplications: Operation = async () => {
  const mutation = gql`
    mutation SanitiseUniformApplications($retentionPeriod: timestamptz) {
      uniformApplications: update_uniform_applications(
        _set: { payload: null, sanitised_at: "now()" }
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
  const {
    uniformApplications: { returning: result },
  } = await $api.client.request<{ uniformApplications: Result }>(mutation, {
    retentionPeriod: getRetentionPeriod(),
  });
  return result;
};

export const sanitiseBOPSApplications: Operation = async () => {
  const mutation = gql`
    mutation SanitiseBOPSApplications($retentionPeriod: timestamptz) {
      bopsApplications: update_bops_applications(
        _set: { request: {}, sanitised_at: "now()" }
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
  const {
    bopsApplications: { returning: result },
  } = await $api.client.request<{ bopsApplications: Result }>(mutation, {
    retentionPeriod: getRetentionPeriod(),
  });
  return result;
};

export const sanitiseEmailApplications: Operation = async () => {
  const mutation = gql`
    mutation SanitiseEmailApplications($retentionPeriod: timestamptz) {
      emailApplications: update_email_applications(
        _set: { request: {}, sanitised_at: "now()" }
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
  const {
    emailApplications: { returning: result },
  } = await $api.client.request<{ emailApplications: Result }>(mutation, {
    retentionPeriod: getRetentionPeriod(),
  });
  return result;
};

export const deleteReconciliationRequests: Operation = async () => {
  const mutation = gql`
    mutation DeleteReconciliationRequests($retentionPeriod: timestamptz) {
      reconciliationRequests: delete_reconciliation_requests(
        where: { created_at: { _lt: $retentionPeriod } }
      ) {
        returning {
          id
        }
      }
    }
  `;
  const {
    reconciliationRequests: { returning: result },
  } = await $api.client.request<{ reconciliationRequests: Result }>(mutation, {
    retentionPeriod: getRetentionPeriod(),
  });
  return result;
};

export const deletePaymentRequests: Operation = async () => {
  const mutation = gql`
    mutation DeletePaymentRequests($retentionPeriod: timestamptz) {
      paymentRequests: delete_payment_requests(
        where: { created_at: { _lt: $retentionPeriod } }
      ) {
        returning {
          id
        }
      }
    }
  `;
  const {
    paymentRequests: { returning: result },
  } = await $api.client.request<{ paymentRequests: Result }>(mutation, {
    retentionPeriod: getRetentionPeriod(),
  });
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
  const [_column_name, ...ids] = response.result?.flat() || [];
  return ids;
};

export const deleteHasuraScheduledEventsForSubmittedSessions: Operation =
  async () => {
    const response = await runSQL(`
    DELETE FROM hdb_catalog.hdb_scheduled_events hse
    WHERE EXISTS (
        SELECT id
        FROM public.lowcal_sessions
        WHERE submitted_at IS NOT NULL
          AND (hse.comment LIKE 'reminder_' || id || '%' OR hse.comment = 'expiry_' || id)
          AND hse.status = 'scheduled'
    )
    RETURNING hse.id;
  `);
    const [_column_name, ...ids] = response?.result?.flat() || [];
    return ids;
  };

export const deleteFeedback: Operation = async () => {
  const mutation = gql`
    mutation DeleteFeedback($retentionPeriod: timestamptz) {
      feedback: delete_feedback(
        where: { created_at: { _lt: $retentionPeriod } }
      ) {
        returning {
          id
        }
      }
    }
  `;
  const {
    feedback: { returning: result },
  } = await $api.client.request<{ feedback: Result }>(mutation, {
    retentionPeriod: getRetentionPeriod(),
  });
  return result;
};
