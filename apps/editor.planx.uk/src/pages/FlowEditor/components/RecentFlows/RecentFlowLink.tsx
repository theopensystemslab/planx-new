import TurnSharpLeftIcon from "@mui/icons-material/TurnSharpLeft";
import Box from "@mui/material/Box";
import { useExternalPortal } from "hooks/data/useExternalPortal";
import React from "react";

import { useRecentFlowsContext } from "./RecentFlowsContext";
import { RecentFlowLinkRoot } from "./styles";

interface Props {
  flow: {
    id: string;
    folderIds: string[];
  };
  isFirst?: boolean;
}

export const RecentFlowLink: React.FC<Props> = ({
  flow: { id, folderIds },
  isFirst,
}) => {
  const { flow } = useExternalPortal(id);
  const { sliceRecentFlows } = useRecentFlowsContext();

  if (!flow) return null;

  // Ensure we navigate back to the correct folder we came from
  const flowSlug = [flow.slug, ...folderIds].join(",");

  return (
    <RecentFlowLinkRoot
      to={"/app/$team/$flow"}
      params={{ team: flow.team.slug, flow: flowSlug }}
      onClick={() => sliceRecentFlows(id)}
    >
      {isFirst ? (
        <Box component="span" sx={{ mr: 0.25 }}>
          back to
        </Box>
      ) : (
        <TurnSharpLeftIcon sx={{ mr: 0.25 }} fontSize="small" />
      )}
      <Box
        component="span"
        className="flow-name"
        title={flow.slug.length > 20 ? flow.slug : undefined}
      >
        {flow.slug.length > 20 ? `${flow.slug.slice(0, 20)}…` : flow.slug}
      </Box>
    </RecentFlowLinkRoot>
  );
};
