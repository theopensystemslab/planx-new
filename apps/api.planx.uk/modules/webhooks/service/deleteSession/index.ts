import { gql } from "graphql-request";

import { $api } from "../../../../client/index.js";

/**
 * Mark a lowcal_session record as deleted
 * Sessions older than 6 months cleaned up nightly by cron job sanitise_application_data on Hasura
 */
export const softDeleteSession = async (sessionId: string) => {
  try {
    const mutation = gql`
      mutation SoftDeleteLowcalSession($sessionId: uuid!) {
        update_lowcal_sessions_by_pk(
          pk_columns: { id: $sessionId }
          _set: { deleted_at: "now()" }
        ) {
          id
        }
      }
    `;
    await $api.client.request(mutation, { sessionId });
  } catch (error) {
    throw new Error(`Error deleting session ${sessionId}`);
  }
};
