import Box from "@mui/material/Box";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import { StatusMarker } from "ui/editor/StatusMarker";

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
    border: `1px solid ${theme.palette.border.light}`,
    borderTop: `6px solid`,
    borderTopColor: hasEveryRequiredNodeBeenUpdated
      ? theme.palette.success.dark
      : theme.palette.warning.dark,
    padding: theme.spacing(1.5, 2, 1.5, 1.5),
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  }),
);

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  margin: theme.spacing(1, 0, 0.5),
  backgroundColor: theme.palette.border.light,
  borderRadius: 8,
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: theme.palette.success.main,
  },
}));

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

  // Nothing to track if the template has no required customisations
  if (!countRequiredNodes) return null;

  const countOutstanding = countRequiredNodes - countCompletedRequiredNodes;
  const progress = countRequiredNodes
    ? (countCompletedRequiredNodes / countRequiredNodes) * 100
    : 100;

  return (
    <Container
      hasEveryRequiredNodeBeenUpdated={hasEveryRequiredNodeBeenUpdated}
    >
      <Box>
        <StatusMarker
          isComplete={hasEveryRequiredNodeBeenUpdated}
          data-testid={
            hasEveryRequiredNodeBeenUpdated
              ? "required-customisations-complete"
              : "outstanding-required-customisations"
          }
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_BOLD }}>
          {hasEveryRequiredNodeBeenUpdated
            ? "All required nodes customised"
            : `${countOutstanding} ${countOutstanding === 1 ? "node" : "nodes"} to customise`}
        </Typography>
        {!hasEveryRequiredNodeBeenUpdated && (
          <Typography variant="body3">
            Customise all required nodes before publishing
          </Typography>
        )}
        <Stack>
          <ProgressBar
            variant="determinate"
            value={progress}
            aria-label="Required nodes customised"
          />
          <Typography variant="caption">
            {countCompletedRequiredNodes} of {countRequiredNodes} required nodes
            customised
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
};
