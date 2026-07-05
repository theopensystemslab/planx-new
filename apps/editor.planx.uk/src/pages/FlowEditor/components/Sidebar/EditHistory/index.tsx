import { gql, useSubscription } from "@apollo/client";
import HistoryIcon from "@mui/icons-material/History";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { HistoryItem } from "lib/api/publishFlow/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { EmptyState } from "ui/editor/EmptyState";
import Permission from "ui/editor/Permission";

import { AddCommentDialog } from "./AddCommentDialog";
import { EditHistoryTimeline } from "./Timeline";

const EditHistory = () => {
  const [flowId, user] = useStore((state) => [state.id, state.user]);

  const { data, loading, error } = useSubscription<{ history: HistoryItem[] }>(
    gql`
      subscription GetFlowHistory($flow_id: uuid = "") {
        history: flow_history(
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
    <Box sx={{ p: 2 }}>
      {user?.id && (
        <Permission.CanEdit>
          <AddCommentDialog flowId={flowId} actorId={user.id} />
        </Permission.CanEdit>
      )}
      {data?.history && <EditHistoryTimeline events={data.history} />}
      {data?.history.length === 0 && (
        <>
          <EmptyState
            size="small"
            title="No changes have been made in the last six months"
            icon={<HistoryIcon />}
          />
        </>
      )}
      {data?.history.length === 50 && (
        <>
          <Divider />
          <Typography variant="body2" sx={{ mt: 2 }} color="GrayText">
            {`History shows the last 50 edits made to this service within the last six months. If you have questions about restoring to an earlier point in time, please contact a developer.`}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default EditHistory;
