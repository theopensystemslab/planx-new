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

export interface HistoryItem {
  id: number;
  type: "operation" | "comment" | "publish";
  createdAt: string;
  actorId: number;
  firstName: string;
  lastName: string;
  data: Operation["data"] | null;
  comment: string | null;
}

const EditHistory = () => {
  const [flowId, canUserEditTeam, teamSlug, user] = useStore(
    (state) => [
      state.id,
      state.canUserEditTeam,
      state.teamSlug,
      state.getUser(),
    ],
  );

  const { data, loading, error } = useSubscription<{ history: HistoryItem[] }>(
    gql`
      subscription GetFlowHistory($flow_id: uuid = "") {
        history: flow_history (
          limit: 50
          where: { flow_id: { _eq: $flow_id } }
          order_by: { created_at: desc }
        ) {
          id
          type
          createdAt: created_at
          actorId: actor_id
          firstName: first_name
          lastName: last_name
          data(path: "op")
          comment
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
  if (!loading && !data?.history) return null;

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
      {user?.id && canUserEditTeam(teamSlug) && <AddCommentDialog flowId={flowId} actorId={user.id} />}
      <EditHistoryTimeline data={data?.history} />
      {data?.history.length === 30 && (
        <>
          <Divider />
          <Typography variant="body2" mt={2} color="GrayText">
            {`History shows the last 50 edits made to this service within the last six months. If you have questions about restoring to an earlier point in time, please contact a PlanX developer.`}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default EditHistory;
