import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlineIcon from "@mui/icons-material/PushPinOutlined";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import React, { useState } from "react";

import { usePinFlow, useUnpinFlow } from "./FlowCard/queries";

interface Props {
  flowId: string;
  userId: number;
  isPinnedByCurrentUser: boolean;
  updateFlow: (flow: FlowSummary) => void;
}

export const FlowPinButton = ({
  flowId,
  userId,
  isPinnedByCurrentUser,
  updateFlow,
}: Props) => {
  const [pinFlow, { loading: isPinLoading }] = usePinFlow({
    flowId,
    userId,
  });
  const [unpinFlow, { loading: isUnpinLoading }] = useUnpinFlow({
    flowId,
  });

  const handlePinFlow = async () => {
    const result = await pinFlow();
    const updatedFlow = result.data?.insert_user_pinned_flows_one?.flow;
    if (updatedFlow) {
      setTooltipOpen(false);
      updateFlow(updatedFlow);
    }
  };

  const handleUnpinFlow = async () => {
    const result = await unpinFlow();
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
            onClick={handleUnpinFlow}
            aria-label="Unpin flow"
            sx={{ borderRadius: "50%" }}
          >
            <PushPinIcon sx={{ fontSize: 24, transform: "translateY(2px)" }} />
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
            onClick={handlePinFlow}
            aria-label="Pin flow"
            sx={{ borderRadius: "50%" }}
          >
            <PushPinOutlineIcon
              sx={{ fontSize: 24, transform: "translateY(2px)" }}
            />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};
