import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useOrderedFlow } from "hooks/useIndexedFlow";
import { useStore } from "pages/FlowEditor/lib/store";

import { CustomisationCard } from "./CustomisationCard";
import { CustomisationCounter } from "./CustomisationCounter";
import { useTemplatedFlowCustomisations } from "./hooks/useTemplatedFlowCustomisations";

const Customisations = () => {
  const [isTemplatedFrom, isTemplate] = useStore((state) => [
    state.isTemplatedFrom,
    state.isTemplate,
  ]);
  const orderedFlow = useOrderedFlow();

  // Get the nodes within this flow that are customisable and sort them top-down to match graph
  const sortedCustomisableNodeIds = orderedFlow
    .filter((node) => Boolean(node.data?.isTemplatedNode))
    .map((node) => node.id);

  const { flowEdits, editedFolderIds, required, completed, loading, error } =
    useTemplatedFlowCustomisations();

  if (error) {
    console.log(error.message);
    return null;
  }

  if (loading) {
    return (
      <Box>
        <DelayedLoadingIndicator
          msDelayBeforeVisible={0}
          text="Fetching customisations..."
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, backgroundColor: "background.paper", minHeight: "100%" }}>
      {isTemplatedFrom && (
        <CustomisationCounter required={required} completed={completed} />
      )}
      {isTemplate && (
        <>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Nodes set to 'Allow edits'
          </Typography>
        </>
      )}
      <List sx={{ mt: 1 }}>
        {sortedCustomisableNodeIds.map((nodeId) => (
          <CustomisationCard
            key={nodeId}
            nodeId={nodeId}
            editedFolderIds={editedFolderIds}
            flowEdits={flowEdits}
          />
        ))}
      </List>
    </Box>
  );
};

export default Customisations;
