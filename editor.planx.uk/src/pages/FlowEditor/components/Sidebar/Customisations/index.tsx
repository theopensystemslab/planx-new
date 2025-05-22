import { gql, useSubscription } from "@apollo/client";
import Done from "@mui/icons-material/Done";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { sortIdsDepthFirst } from "@planx/graph";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const Customisations = () => {
  const [flowId, flow] = useStore((state) => [state.id, state.flow]);

  // Get the nodes within this flow that are customisable and sort them top-down to match graph
  const customisableNodeIds = new Set(Object.entries(flow)
    .filter(([_nodeId, nodeData]) => nodeData.data?.tags?.includes("customisation"))
    .map((entry) => entry[0]));
  const sortedCustomisableNodeIds = sortIdsDepthFirst(flow)(customisableNodeIds);

  // Subscribe to edits in order to mark customisable nodes "done"
  const { data, loading, error } = useSubscription<any>(
    gql`
      subscription GetTemplatedFlowEdits($flow_id: uuid = "") {
        edits: templated_flow_edits(where: { flow_id: { _eq: $flow_id } }) {
          data
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
          text="Fetching customisations..."
        />
      </Box>
    );
  }

  const edits = data?.edits?.[0]?.data || {};

  // TODO styles !
  //   "To do", "done/successfully customised", what can we re-use from Search (eg link to modal)?
  return (
    <Box p={2}>
      <Typography variant="h4" mb={1}>
        {`Customise`}
      </Typography>
      <Typography variant="body2">
        {`When editing a template, this tab tracks your progress updating each component tagged "Customisation".`}
      </Typography>
      <List>
        {sortedCustomisableNodeIds.map((nodeId) => (
          <ListItem
            key={nodeId}
            sx={{
              display: "list-item",
              backgroundColor: (theme) =>
                Object.keys(edits)?.includes(nodeId)
                  ? theme.palette.background.paper
                  : theme.palette.nodeTag.blocking, // same color as "customisation" tag for now
              border: `1px solid`,
              borderColor: (theme) => theme.palette.border.main,
              padding: (theme) => theme.spacing(2),
              marginBottom: (theme) => theme.spacing(2),
            }}
          >
            <Typography variant="h5" alignContent="center" alignItems="center">
              {Object.keys(edits)?.includes(nodeId) && <Done color="success" />}
              {`${
                flow[nodeId].data?.title ||
                flow[nodeId].data?.text ||
                flow[nodeId].type
              }`}
            </Typography>
            {Object.keys(edits)?.includes(nodeId) && (
              <Typography variant="body2">
                {/** TODO decide whether to include details of _what_ was edited? Just logging data for now! */}
                {JSON.stringify(edits[nodeId])}
              </Typography>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Customisations;
