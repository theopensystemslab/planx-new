import { gql, useSubscription } from "@apollo/client";
import HistoryIcon from "@mui/icons-material/History";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import type { OT } from "@planx/graph/types";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type {
  HistoryItem,
  OperationHistoryItem,
} from "lib/api/publishFlow/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { EmptyState } from "ui/editor/EmptyState";

import { EditHistoryTimeline } from "../../Sidebar/EditHistory/Timeline";

type ComponentHistoryItem = HistoryItem & {
  operationId: number;
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
          where: { flow_id: { _eq: $flow_id }, node_id: { _in: $node_ids } }
          order_by: { created_at: desc }
        ) {
          operationId: operation_id
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

  // Group each deconstructed node edit by original operation ID so that `data` is an array ahead of being passed to `formatOps`
  const formattedHistory = Array.from(
    (data?.history || [])
      .reduce((map, { operationId, data, ...rest }) => {
        if (!map.has(operationId)) {
          map.set(operationId, { ...rest, id: operationId, data: [] });
        }
        map.get(operationId)?.data.push(data);
        return map;
      }, new Map<number, OperationHistoryItem>())
      .values(),
  );

  return (
    <Box sx={{ p: 2, mr: 3 }}>
      {data?.history && data.history.length > 0 && (
        <>
          <EditHistoryTimeline
            events={formattedHistory}
            showRestore={false}
            showDottedConnector={true}
          />
          <Divider />
          <Typography variant="body2" sx={{ mt: 2 }} color="GrayText">
            {`History shows edits over the last 12 months. To view an earlier point in time, please contact #help-issues-odp-products.`}
          </Typography>
        </>
      )}
      {data?.history.length === 0 && (
        <>
          <EmptyState
            size="small"
            title="No edits found in the last 12 months"
            icon={<HistoryIcon />}
          />
        </>
      )}
    </Box>
  );
};

export default ComponentHistory;
