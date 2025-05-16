import { gql, useSubscription } from "@apollo/client";
import Done from "@mui/icons-material/Done";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const Customisations = () => {
  const [flowId, flow] = useStore((state) => [state.id, state.flow]);

  // TODO return "Options" of Questions & Checklist and Internal Portal children? Sort depth first?
  const customisableNodeIds = Object.entries(flow)
    .filter(
      ([_nodeId, nodeData]) => nodeData.data?.tags?.includes("customisation"),
    )
    .map((entry) => entry[0]);

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

  const edits = data?.edits?.[0]?.data;

  return (
    <Box p={2}>
      <Typography variant="h4" mb={1}>
        {`Customise`}
      </Typography>
      <Typography variant="body2">
        {`When editing a template, this tab tracks your progress updating each component tagged "Customisation".`}
      </Typography>
      <List>
        {customisableNodeIds.map((nodeId) => (
          <ListItem
            key={nodeId}
            sx={{
              display: "list-item",
              backgroundColor: (theme) =>
                Object.keys(edits).includes(nodeId)
                  ? theme.palette.background.paper
                  : "#FAE1B7",
              border: `1px solid`,
              borderColor: (theme) => theme.palette.border.main,
              padding: (theme) => theme.spacing(2),
              marginBottom: (theme) => theme.spacing(2),
            }}
          >
            <Typography variant="h5" alignContent="center" alignItems="center">
              {Object.keys(edits).includes(nodeId) && <Done color="success" />}
              {`${
                flow[nodeId].data?.title ||
                flow[nodeId].data?.text ||
                flow[nodeId].type
              }`}
            </Typography>
            {Object.keys(edits).includes(nodeId) && (
              <Typography variant="body2">
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
