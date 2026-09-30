import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import { useCallback, useEffect } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";

import { hasNodeBeenUpdated } from "./helpers";
import type { FlowEdits } from "./types";

interface Props {
  flowEdits: FlowEdits;
  customisableNodeIds: string[];
}

const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
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

  const hasEveryRequiredNodeBeenUpdatedCallback = useCallback(() => {
    return requiredCustomisableNodeIds.every((requiredNodeId) =>
      hasNodeBeenUpdated(requiredNodeId, flow, flowEdits, orderedFlow),
    );
  }, [flowEdits, customisableNodeIds]);

  const hasEveryRequiredNodeBeenUpdated = Boolean(
    hasEveryRequiredNodeBeenUpdatedCallback(),
  );

  useEffect(() => {
    // Disable the "Publish" button if there are outstanding required customisations
    //  ** this allows us to skip re-checking requirements via API's publish validation checks
    useStore.setState({
      disableTemplatedFlowPublishing: !hasEveryRequiredNodeBeenUpdated,
    });
  }, [flowEdits, customisableNodeIds]);

  return hasEveryRequiredNodeBeenUpdated ? (
    <Container>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_BOLD }}>
        All required nodes have been customised
      </Typography>
      <CheckCircleIcon
        data-testid="all-customisations-complete"
        fontSize="medium"
        sx={(theme) => ({
          color: theme.palette.success.main,
          marginRight: theme.spacing(1),
        })}
      />
    </Container>
  ) : (
    <Container>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_BOLD }}>
        You have outstanding customisations, update each required node before
        publishing
      </Typography>
      <CheckCircleIcon
        data-testid="outstanding-customisations"
        fontSize="medium"
        sx={(theme) => ({
          color: theme.palette.warning.main,
          marginRight: theme.spacing(1),
        })}
      />
    </Container>
  );
};
