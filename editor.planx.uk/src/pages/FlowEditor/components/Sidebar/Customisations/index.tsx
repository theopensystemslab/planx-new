import { gql, useSubscription } from "@apollo/client";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import { sortIdsDepthFirst } from "@planx/graph";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { CustomisationCard } from "./CustomisationCard";
import { FlowEdits } from "./types";

const Customisations = () => {
  const [flowId, flow] = useStore((state) => [
    state.id,
    state.flow,
  ]);

  // Get the nodes within this flow that are customisable and sort them top-down to match graph
  const customisableNodeIds = new Set(Object.entries(flow)
    .filter(([_nodeId, nodeData]) => nodeData.data?.tags?.includes("customisation"))
    .map((entry) => entry[0]));
  const sortedCustomisableNodeIds = sortIdsDepthFirst(flow)(customisableNodeIds);

  // Subscribe to edits in order to mark customisable nodes "done"
  const { data, loading, error } = useSubscription<{ edits: [{ data: FlowEdits }] }>(
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
      <List sx={{ mt: 1 }}>
        {
          sortedCustomisableNodeIds.map((nodeId) => <CustomisationCard key={nodeId} nodeId={nodeId} nodeEdits={edits[nodeId]} />)
        }
      </List>
    </Box>
  );
};

export default Customisations;
