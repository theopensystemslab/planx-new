import Box from "@mui/material/Box";
import { useNavigate } from "@tanstack/react-router";
import { formatLastEditMessage } from "pages/FlowEditor/utils";
import React from "react";
import { cardBoxShadow } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";

import { Badge } from "../../../components/Badge/Badge";
import { BadgeVariant } from "../../../components/Badge/types";
import { SearchListItemDetail } from "./SearchListItemDetail";
import { SearchListItemDetailActions } from "./SearchListItemDetailActions";
import type { SearchResult } from "./SearchResult";
import { useCopyFlowToTeam } from "./useCopyFlowToTeam";
import type { FlowSearchResult } from "./useSearchFlows";

interface FlowDetailsPanelProps {
  flow: FlowSearchResult;
  canCopy: boolean;
}

export const FlowDetailsPanel: React.FC<FlowDetailsPanelProps> = ({
  flow,
  canCopy,
}) => {
  const navigate = useNavigate();
  const { copyToTeam, isPending } = useCopyFlowToTeam();

  const editMessage = flow.operations[0]
    ? formatLastEditMessage(
        flow.operations[0].createdAt,
        flow.operations[0].actor,
      ).formatted
    : undefined;

  const hasSendComponent = Boolean(flow.publishedFlows[0]?.hasSendComponent);

  const result: SearchResult = {
    icon: <Badge variant={BadgeVariant.Team} team={flow.team} size="compact" />,
    sourceTeam: flow.team.name,
    statusLabel: flow.status === "online" ? "Online" : undefined,
    title: flow.name,
    meta: editMessage,
    tag: hasSendComponent ? (
      <FlowTag tagType={FlowTagType.ServiceType}>Submission</FlowTag>
    ) : undefined,
    description: flow.summary ?? undefined,
    primaryAction:
      canCopy && flow.canCreateFromCopy
        ? {
            label: "Copy to my team",
            onClick: () => copyToTeam(flow),
            disabled: isPending,
          }
        : undefined,
    secondaryAction: {
      label: "View flow",
      onClick: () =>
        navigate({
          to: "/app/$team/$flow",
          params: { team: flow.team.slug, flow: flow.slug },
        }),
    },
  };

  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.palette.border.light}`,
        borderRadius: "4px",
        boxShadow: cardBoxShadow,
        backgroundColor: theme.palette.background.default,
        overflow: "hidden",
      })}
    >
      <Box sx={{ p: 3 }}>
        <SearchListItemDetail result={result} />
      </Box>
      <SearchListItemDetailActions
        primaryAction={result.primaryAction}
        secondaryAction={result.secondaryAction}
      />
    </Box>
  );
};
