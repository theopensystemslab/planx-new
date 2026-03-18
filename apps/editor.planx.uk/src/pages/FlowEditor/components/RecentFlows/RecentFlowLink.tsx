import TurnSharpLeftIcon from "@mui/icons-material/TurnSharpLeft";
import Box from "@mui/material/Box";
import { type HistoryState } from "@tanstack/react-router";
import { useExternalPortal } from "hooks/data/useExternalPortal";
import React from "react";

import { RecentFlowLinkRoot } from "./styles";

export const RecentFlowLink: React.FC<{
  flowId: string;
  isFirst?: boolean;
}> = ({ flowId, isFirst }) => {
  const { flow } = useExternalPortal(flowId);
  if (!flow) return null;

  const sliceHistoryUpTo = (targetFlowId: string) => {
    return (prev: HistoryState): HistoryState => {
      const flows = prev.recentFlows || [];
      const index = flows.indexOf(targetFlowId);

      return {
        ...prev,
        recentFlows: index >= 0 ? flows.slice(0, index) : flows,
      };
    };
  };

  return (
    <RecentFlowLinkRoot
      to={"/app/$team/$flow"}
      // TODO: Handle folders
      params={{ team: flow.team.slug, flow: flow.slug }}
      state={sliceHistoryUpTo(flowId)}
    >
      {isFirst ? (
        <Box component="span" sx={{ mr: 0.25 }}>
          back to
        </Box>
      ) : (
        <TurnSharpLeftIcon sx={{ mr: 0.25 }} fontSize="small" />
      )}
      <Box component="span" className="flow-name">
        {flow.name}
      </Box>
    </RecentFlowLinkRoot>
  );
};
