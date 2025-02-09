import { gql, useSubscription } from "@apollo/client";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Operation } from "types";
import { AddCommentDialog } from "./AddCommentDialog";
import { EditHistoryTimeline } from "./Timeline";

const EditHistory = () => {
  const [flowId, canUserEditTeam, teamSlug] = useStore(
    (state) => [
      state.id,
      state.canUserEditTeam,
      state.teamSlug,
    ],
  );

  const { data, loading, error } = useSubscription<{ operations: Operation[] }>(
    gql`
      subscription GetRecentOperations($flow_id: uuid = "") {
        operations(
          limit: 15
          where: { flow_id: { _eq: $flow_id } }
          order_by: { created_at: desc }
        ) {
          id
          createdAt: created_at
          actor {
            id
            firstName: first_name
            lastName: last_name
          }
          data(path: "op")
        }
      }
    `,
    {
      variables: {
        flow_id: flowId,
      },
    },
  );

  if (error) {
    console.log(error.message);
    return null;
  }

  // Handle missing operations (e.g. non-production data)
  if (!loading && !data?.operations) return null;

  if (loading && !data) {
    return (
      <Box>
        <DelayedLoadingIndicator
          msDelayBeforeVisible={0}
          text="Fetching edit history..."
        />
      </Box>
    );
  }

  return (
    <Box>
      {canUserEditTeam(teamSlug) && <AddCommentDialog />}
      <EditHistoryTimeline operations={data?.operations} />
      {data?.operations.length === 15 && (
        <>
          <Divider />
          <Typography variant="body2" mt={2} color="GrayText">
            {`History shows the last 15 edits made to this service. If you have questions about restoring to an earlier point in time, please contact a PlanX developer.`}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default EditHistory;
