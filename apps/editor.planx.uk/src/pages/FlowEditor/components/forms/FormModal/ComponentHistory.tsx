import { gql, useSubscription } from "@apollo/client";
import HistoryIcon from "@mui/icons-material/History";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import type { OT } from "@planx/graph/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { HistoryItem } from "lib/api/publishFlow/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { EmptyState } from "ui/editor/EmptyState";

import { EditHistoryTimeline } from "../../Sidebar/EditHistory/Timeline";

type ComponentHistoryItem = HistoryItem & {
  type: "operation";
  data: OT.Op;
};

const ComponentHistory = (props: { nodeId: string }) => {
  const { nodeId } = props;
  const [flowId, flow] = useStore((state) => [state.id, state.flow]);

  // If the current node is a [Responsive]Question/Checklist/Filter, we also want to get history of its' options (aka edges)
  const nodeIds = [nodeId].concat(flow[nodeId]?.edges || []);

  const { data, loading, error } = useSubscription<{
    history: ComponentHistoryItem[];
  }>(
    gql`
      subscription GetNodeHistory($flow_id: uuid = "", $node_ids: [String!]) {
        history: node_content_history(
          limit: 50
          where: { flow_id: { _eq: $flow_id }, node_id: { _in: $node_ids } }
          order_by: { created_at: desc }
        ) {
          type
          data
          createdAt: created_at
          actorId: actor_id
          firstName: first_name
          lastName: last_name
        }
      }
    `,
    {
      variables: {
        flow_id: flowId,
        node_ids: nodeIds,
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

  // Re-wrap each deconstructed node operation into an array ahead of being passed to `formatOps`
  // TODO maybe re-group by operation ID too ??
  const formattedHistory = data?.history.map((item) => ({
    ...item,
    data: [item.data],
  })) as HistoryItem[];

  return (
    <Box sx={{ p: 2, mr: 3 }}>
      {data?.history && (
        <EditHistoryTimeline
          events={formattedHistory}
          showRestore={false}
          showDottedConnector={true}
        />
      )}
      {data?.history.length === 0 && (
        <>
          <EmptyState
            size="small"
            title="No changes have been made in the last year"
            icon={<HistoryIcon />}
          />
        </>
      )}
      {data?.history.length === 50 && (
        <>
          <Divider />
          <Typography variant="body2" sx={{ mt: 2 }} color="GrayText">
            {`History shows the last 50 edits made to this component within the last year. If you have questions about viewing an earlier point in time, please contact a developer.`}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default ComponentHistory;
