import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import { useCallback, useEffect } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";
import SlashCircleIcon from "ui/icons/SlashCircle";

import { hasNodeBeenUpdated } from "./helpers";
import type { FlowEdits } from "./types";

interface Props {
  flowEdits: FlowEdits;
  customisableNodeIds: string[];
}

const Container = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasEveryRequiredNodeBeenUpdated",
})<{ hasEveryRequiredNodeBeenUpdated: boolean }>(
  ({ theme, hasEveryRequiredNodeBeenUpdated }) => ({
    background: theme.palette.background.default,
    borderTop: `6px solid`,
    borderTopColor: hasEveryRequiredNodeBeenUpdated
      ? theme.palette.success.dark
      : theme.palette.warning.dark,
    padding: theme.spacing(1),
    margin: theme.spacing(0.5),
    display: "flex",
  }),
);

export const CustomisationCounter: React.FC<Props> = ({
  flowEdits,
  customisableNodeIds,
}) => {
  const [flow, orderedFlow] = useStore((state) => [
    state.flow,
    state.orderedFlow,
  ]);

  const requiredCustomisableNodeIds = customisableNodeIds.filter(
    (id) => flow[id]?.data?.areTemplatedNodeInstructionsRequired === true,
  );

  const countCompletedRequiredNodesCallback = useCallback(() => {
    let counter = 0;
    requiredCustomisableNodeIds.forEach((requiredNodeId) => {
      const isComplete = hasNodeBeenUpdated(
        requiredNodeId,
        flow,
        flowEdits,
        orderedFlow,
      );
      if (isComplete) counter += 1;
    });
    return counter;
  }, [flowEdits, customisableNodeIds]);

  const countRequiredNodes = requiredCustomisableNodeIds.length;
  const countCompletedRequiredNodes = countCompletedRequiredNodesCallback();

  const hasEveryRequiredNodeBeenUpdated =
    countCompletedRequiredNodes === countRequiredNodes;

  useEffect(() => {
    // Disable the "Publish" button if there are outstanding required customisations
    //  ** this allows us to skip re-checking requirements via API's publish validation checks
    useStore.setState({
      disableTemplatedFlowPublishing: !hasEveryRequiredNodeBeenUpdated,
    });
  }, [flowEdits, customisableNodeIds]);

  return hasEveryRequiredNodeBeenUpdated ? (
    <Container
      hasEveryRequiredNodeBeenUpdated={hasEveryRequiredNodeBeenUpdated}
    >
      <CheckCircleIcon
        data-testid="required-customisations-complete"
        fontSize="medium"
        sx={(theme) => ({
          color: theme.palette.success.main,
          marginRight: theme.spacing(1),
        })}
      />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_BOLD }}>
          All required nodes have been customised
        </Typography>
        <Typography variant="caption">
          {countCompletedRequiredNodes} of {countRequiredNodes} required nodes
          customised
        </Typography>
      </Box>
    </Container>
  ) : (
    <Container
      hasEveryRequiredNodeBeenUpdated={hasEveryRequiredNodeBeenUpdated}
    >
      <SlashCircleIcon
        data-testid="outstanding-required-customisations"
        fontSize="medium"
        sx={(theme) => ({
          color: theme.palette.warning.main,
          marginRight: theme.spacing(1),
        })}
      />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_BOLD }}>
          {countRequiredNodes - countCompletedRequiredNodes} required nodes to
          customise
        </Typography>
        <Typography variant="body2">
          Customise every required node before publishing
        </Typography>
        <Typography variant="caption">
          {countCompletedRequiredNodes} of {countRequiredNodes} required nodes
          customised
        </Typography>
      </Box>
    </Container>
  );
};
