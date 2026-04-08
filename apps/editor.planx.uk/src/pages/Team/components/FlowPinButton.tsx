import { useMutation } from "@apollo/client";
import StarIcon from "@mui/icons-material/Star";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React, { useState } from "react";

import { useStore } from "../../FlowEditor/lib/store";
import { PIN_FLOW, UNPIN_FLOW } from "./FlowCard/queries";

interface Props {
  flowId: string;
  isPinnedByCurrentUser: boolean;
  updateFlow: (flow: FlowSummary) => void;
}

export const FlowPinButton = ({
  flowId,
  isPinnedByCurrentUser,
  updateFlow,
}: Props) => {
  const user = useStore((state) => state.user);

  const [pinFlow, { loading: isPinLoading }] = useMutation<{
    insert_user_pinned_flows_one: { flow: FlowSummary };
  }>(PIN_FLOW);

  const [unpinFlow, { loading: isUnpinLoading }] = useMutation<{
    delete_user_pinned_flows: { returning: { flow: FlowSummary }[] };
  }>(UNPIN_FLOW);

  const handlePinFlow = async (flowId: string) => {
    if (!user) {
      return;
    }

    const result = await pinFlow({
      variables: { flowId, userId: user.id },
    });
    const updatedFlow = result.data?.insert_user_pinned_flows_one?.flow;
    if (updatedFlow) {
      setTooltipOpen(false);
      updateFlow(updatedFlow);
    }
  };

  const handleUnpinFlow = async (flowId: string) => {
    const result = await unpinFlow({ variables: { flowId } });
    const updatedFlow =
      result.data?.delete_user_pinned_flows?.returning?.[0]?.flow;

    if (updatedFlow) {
      setTooltipOpen(false);
      updateFlow(updatedFlow);
    }
  };

  const isLoading = isPinLoading || isUnpinLoading;
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Box sx={{ position: "relative", zIndex: 2, display: "inline-flex" }}>
      {isLoading && (
        <CircularProgress
          size={34}
          disableShrink
          thickness={1}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            animationDuration: "700ms",
          }}
        />
      )}
      {isPinnedByCurrentUser ? (
        <Tooltip
          title="Unpin flow"
          open={tooltipOpen}
          onOpen={() => setTooltipOpen(true)}
          onClose={() => setTooltipOpen(false)}
        >
          <IconButton
            size="small"
            onClick={() => handleUnpinFlow(flowId)}
            aria-label="Unpin flow"
            sx={{ borderRadius: "50%" }}
          >
            <StarIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip
          title="Pin flow"
          open={tooltipOpen}
          onOpen={() => setTooltipOpen(true)}
          onClose={() => setTooltipOpen(false)}
        >
          <IconButton
            size="small"
            onClick={() => handlePinFlow(flowId)}
            aria-label="Pin flow"
            disabled={!user}
            sx={{ borderRadius: "50%" }}
          >
            <StarOutlineIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
