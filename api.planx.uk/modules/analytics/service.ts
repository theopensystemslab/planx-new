import { gql } from "graphql-request";
import { adminGraphQLClient as adminClient } from "../../hasura";

export const trackAnalyticsLogExit = async ({
  id,
  isUserExit,
}: {
  id: number;
  isUserExit: boolean;
}) => {
  try {
    const result = await adminClient.request(
      gql`
        mutation UpdateAnalyticsLogUserExit($id: bigint!, $user_exit: Boolean) {
          update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _set: { user_exit: $user_exit }
          ) {
            id
            user_exit
            analytics_id
          }
        }
      `,
      {
        id,
        user_exit: isUserExit,
      },
    );

    const analyticsId = result.update_analytics_logs_by_pk.analytics_id;
    await adminClient.request(
      gql`
        mutation SetAnalyticsEndedDate($id: bigint!, $ended_at: timestamptz) {
          update_analytics_by_pk(
            pk_columns: { id: $id }
            _set: { ended_at: $ended_at }
          ) {
            id
          }
        }
      `,
      {
        id: analyticsId,
        ended_at: isUserExit ? new Date().toISOString() : null,
      },
    );
  } catch (e) {
    // We need to catch this exception here otherwise the exception would become an unhandled rejection which brings down the whole node.js process
    console.error(
      "There's been an error while recording metrics for analytics but because this thread is non-blocking we didn't reject the request",
      (e as Error).stack,
    );
  }

  return;
};

export const trackUserReset = async ({
  id,
  flow_direction,
}: {
  id: number;
  flow_direction: string;
}) => {
  try {
    await adminClient.request(
      gql`
        mutation UpdateAnalyticsLogUserReset(
          $id: bigint!
          $flow_direction: String
        ) {
          update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _set: { flow_direction: $flow_direction }
          ) {
            id
          }
        }
      `,
      {
        id,
        flow_direction: flow_direction,
      },
    );
  } catch (e) {
    // We need to catch this exception here otherwise the exception would become an unhandled rejection which brings down the whole node.js process
    console.error(
      "There's been an error while recording metrics for analytics but because this thread is non-blocking we didn't reject the request",
      (e as Error).stack,
    );
  }
  return;
};
