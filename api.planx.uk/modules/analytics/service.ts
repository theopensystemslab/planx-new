import { gql } from "graphql-request";
import { $public } from "../../client";

interface UpdateAnalyticsLogUserExit {
  analyticsLog: {
    id: string;
    userExit: boolean;
    analyticsId: string;
  }
}

export const trackAnalyticsLogExit = async ({
  id,
  isUserExit,
}: {
  id: number;
  isUserExit: boolean;
}) => {
  try {
    const result = await $public.client.request<UpdateAnalyticsLogUserExit>(
      gql`
        mutation UpdateAnalyticsLogUserExit($id: bigint!, $user_exit: Boolean) {
          analyticsLog: update_analytics_logs_by_pk(
            pk_columns: { id: $id }
            _set: { user_exit: $user_exit }
          ) {
            id
            userExit: user_exit
            analyticsId: analytics_id
          }
        }
      `,
      {
        id,
        user_exit: isUserExit,
      },
    );

    const analyticsId = result.analyticsLog.analyticsId;
    await $public.client.request(
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
