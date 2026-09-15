import { useNavigate } from "@tanstack/react-router";
import { formatLastEditMessage } from "pages/FlowEditor/utils";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";

import { Badge } from "../../../components/Badge/Badge";
import { BadgeVariant } from "../../../components/Badge/types";
import { DetailsPanelCard } from "./DetailsPanelCard";
import { SearchListItemDetail } from "./SearchListItemDetail";
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
  const statusVariant =
    flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;

  const result: SearchResult = {
    icon: <Badge variant={BadgeVariant.Team} team={flow.team} size="compact" />,
    sourceTeam: flow.team.name,
    title: flow.name,
    meta: editMessage,
    tag: (
      <>
        <FlowTag tagType={FlowTagType.Status} statusVariant={statusVariant}>
          {statusVariant}
        </FlowTag>
        {hasSendComponent && (
          <FlowTag tagType={FlowTagType.ServiceType}>Submission</FlowTag>
        )}
      </>
    ),
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
    <DetailsPanelCard
      primaryAction={result.primaryAction}
      secondaryAction={result.secondaryAction}
    >
      <SearchListItemDetail result={result} />
    </DetailsPanelCard>
  );
};
