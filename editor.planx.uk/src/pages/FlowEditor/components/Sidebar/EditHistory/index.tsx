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

export type HistoryItem = OperationHistoryItem | CommentHistoryItem | PublishHistoryItem;

interface BaseHistoryItem {
  id: number
  createdAt: string;
  actorId: number | undefined;
  firstName: string;
  lastName: string;
}

export interface OperationHistoryItem extends BaseHistoryItem {
  type: "operation";
  data: Operation["data"];
  comment: null;
}

export interface CommentHistoryItem extends BaseHistoryItem {
  type: "comment";
  data: null;
  comment: string;
}

export interface PublishHistoryItem extends BaseHistoryItem {
  type: "publish";
  data: null;
  comment: string | null; // @todo require input in future publish modal changes
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

  // Handle missing operations (e.g. non-production data)
  if (!loading && !data?.history) return null;

  return (
    <Box>
      {user?.id && canUserEditTeam(teamSlug) && <AddCommentDialog flowId={flowId} actorId={user.id} />}
      {data?.history && <EditHistoryTimeline events={data.history} />}
      {data?.history.length === 30 && (
        <>
          <Divider />
          <Typography variant="body2" mt={2} color="GrayText">
            {`History shows the last 50 edits made to this service within the last six months. If you have questions about restoring to an earlier point in time, please contact a developer.`}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default EditHistory;
