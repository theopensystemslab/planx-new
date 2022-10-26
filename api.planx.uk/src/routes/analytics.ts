import express from "express";
import { adminGraphQLClient as client } from "../hasura";

let router = express.Router();

const trackAnalyticsLogExit = async (id: number, isUserExit: boolean) => {
  try {
    const result = await client.request(
      `
      mutation UpdateAnalyticsLogUserExit($id: bigint!, $user_exit: Boolean) {
        update_analytics_logs_by_pk(
          pk_columns: {id: $id},
          _set: {user_exit: $user_exit}
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
      }
    );

    const analytics_id = result.update_analytics_logs_by_pk.analytics_id;
    await client.request(
      `
      mutation SetAnalyticsEndedDate($id: bigint!, $ended_at: timestamptz) {
        update_analytics_by_pk(pk_columns: {id: $id}, _set: {ended_at: $ended_at}) {
          id
        }
      }
    `,
      {
        id: analytics_id,
        ended_at: isUserExit ? new Date().toISOString() : null,
      }
    );
  } catch (e) {
    // We need to catch this exception here otherwise the exception would become an unhandle rejection which brings down the whole node.js process
    console.error(
      "There's been an error while recording metrics for analytics but because this thread is non-blocking we didn't reject the request",
      (e as Error).stack
    );
  }

  return;
};

router.post("/analytics/log-user-exit", async (req, res, _next) => {
  const analyticsLogId = Number(req.query.analyticsLogId);
  if (analyticsLogId > 0) trackAnalyticsLogExit(analyticsLogId, true);
  res.send();
});

router.post("/analytics/log-user-resume", async (req, res, _next) => {
  const analyticsLogId = Number(req.query.analyticsLogId);
  if (analyticsLogId > 0) trackAnalyticsLogExit(analyticsLogId, false);
  res.send();
});

export default router;
