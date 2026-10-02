import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";
import DashedCircleIcon from "ui/icons/DashedCircle";

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

  const countRequiredNodes = requiredCustomisableNodeIds.length;
  const countCompletedRequiredNodes = requiredCustomisableNodeIds.filter(
    (requiredNodeId) =>
      hasNodeBeenUpdated(requiredNodeId, flow, flowEdits, orderedFlow),
  ).length;

  const hasEveryRequiredNodeBeenUpdated =
    countCompletedRequiredNodes === countRequiredNodes;

  useEffect(() => {
    // Set basic EditorStore state so other components (publish button, templated status)
    //   can reference it without re-calculating
    useStore.setState({
      outstandingTemplatedFlowCustomisations:
        countRequiredNodes - countCompletedRequiredNodes,
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
      <DashedCircleIcon
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
