import { gql, useQuery } from "@apollo/client";
import { useNavigate } from "@tanstack/react-router";
import { useToast } from "hooks/useToast";
import { SYSTEM_TEAMS } from "lib/systemTeams";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastEditMessage } from "pages/FlowEditor/utils";
import { useCreateFlow } from "pages/Flows/components/AddFlow/hooks/useCreateFlow";
import { useState } from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import { slugify } from "utils";

import { Badge } from "../../../components/Badge/Badge";
import { BadgeVariant } from "../../../components/Badge/types";
import type { SearchResult } from "./SearchResult";
import type { Template } from "./types";

interface TemplateDetails {
  team: { name: string };
  operations: {
    id: number;
    createdAt: string;
    actor?: { firstName: string; lastName: string };
  }[];
  publishedFlows: { id: number; hasSendComponent: boolean }[];
  usedByTeams: {
    id: string;
    team: {
      id: number;
      name: string;
      theme: {
        primaryColour?: string | null;
        logo?: string | null;
      };
    };
  }[];
}

const GET_TEMPLATE_DETAILS = gql`
  query GetTemplateDetails($id: uuid!, $systemTeams: [String!]!) {
    flow: flows_by_pk(id: $id) {
      id
      team {
        name
      }
      operations(limit: 1, order_by: { created_at: desc }) {
        id
        createdAt: created_at
        actor {
          firstName: first_name
          lastName: last_name
        }
      }
      publishedFlows: published_flows(
        order_by: { created_at: desc }
        limit: 1
      ) {
        id
        hasSendComponent: has_send_component
      }
      usedByTeams: templated_flows(
        distinct_on: team_id
        order_by: [{ team_id: asc }, { created_at: desc }]
        where: { team: { slug: { _nin: $systemTeams } } }
      ) {
        id
        team {
          id
          name
          theme {
            primaryColour: primary_colour
            logo
          }
        }
      }
    }
  }
`;

interface UseTemplateDetailsOptions {
  skip?: boolean;
  onAdded?: () => void;
}
export const useTemplateDetails = (
  template: Template,
  { skip = false, onAdded }: UseTemplateDetailsOptions = {},
) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [
    teamId,
    teamName,
    teamSlug,
    canUserEditTeam,
    showLoading,
    hideLoading,
    setLoadingCompleteCallback,
  ] = useStore((state) => [
    state.teamId,
    state.teamName,
    state.teamSlug,
    state.canUserEditTeam,
    state.showLoading,
    state.hideLoading,
    state.setLoadingCompleteCallback,
  ]);

  const { data } = useQuery<{ flow: TemplateDetails | null }>(
    GET_TEMPLATE_DETAILS,
    {
      variables: { id: template.id, systemTeams: SYSTEM_TEAMS },
      skip,
    },
  );

  const details = data?.flow ?? undefined;
  const { mutate: createFlow, isPending } = useCreateFlow();

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const isAlreadySubscribed = Boolean(
    details?.usedByTeams.some(({ team }) => team.id === teamId),
  );

  const handleAddToTeam = () => {
    const name = `${template.name} (templated)`;

    setLoadingCompleteCallback(() => {
      toast.success("Flow created successfully");
      setLoadingCompleteCallback(undefined);
    });
    showLoading("Creating flow...");

    createFlow(
      {
        mode: "template",
        flow: {
          sourceId: template.id,
          teamId,
          name,
          slug: slugify(name),
          isPattern: false,
          isTemplate: false,
          isService: false,
        },
      },
      {
        onSuccess: async ({ flow }) => {
          onAdded?.();
          await navigate({
            to: "/app/$team/$flow",
            params: { team: teamSlug, flow: flow.slug },
          });
          hideLoading();
        },
        onError: () => {
          setLoadingCompleteCallback(undefined);
          hideLoading();
          toast.error("Failed to add template to your team");
        },
      },
    );
  };

  const editMessage = details?.operations[0]
    ? formatLastEditMessage(
        details.operations[0].createdAt,
        details.operations[0].actor,
      ).formatted
    : undefined;

  const usedByTeams = [...(details?.usedByTeams ?? [])].sort((a, b) => {
    if (a.team.id === teamId) return -1;
    if (b.team.id === teamId) return 1;
    return 0;
  });

  const usedByCount = usedByTeams.length;

  const usedByLabel = (() => {
    if (canUserEditTeam(teamSlug) && isAlreadySubscribed) {
      const otherTeamsCount = usedByCount - 1;
      if (otherTeamsCount === 0) return `Subscribed to by ${teamName}:`;
      return `Subscribed to by ${teamName} and ${otherTeamsCount} other team${otherTeamsCount === 1 ? "" : "s"}:`;
    }
    return `Subscribed to by ${usedByCount} team${usedByCount === 1 ? "" : "s"}:`;
  })();

  const result: SearchResult = {
    icon: <Badge variant={BadgeVariant.SourceTemplate} size="compact" />,
    sourceTeam: details?.team.name ?? template.team.name,
    statusLabel:
      canUserEditTeam(teamSlug) && isAlreadySubscribed
        ? "Subscribed"
        : undefined,
    title: template.name,
    meta: editMessage,
    tag: details?.publishedFlows[0]?.hasSendComponent ? (
      <FlowTag tagType={FlowTagType.ServiceType}>Submission</FlowTag>
    ) : undefined,
    description: template.summary,
    relatedItems:
      usedByCount > 0
        ? {
            label: usedByLabel,
            items: usedByTeams.map(({ team }) => ({
              key: team.id,
              tooltip: team.name,
              icon: (
                <Badge variant={BadgeVariant.Team} team={team} size="compact" />
              ),
            })),
          }
        : undefined,
    primaryAction: canUserEditTeam(teamSlug)
      ? {
          label: "Add to my team",
          onClick: () =>
            isAlreadySubscribed
              ? setIsConfirmationOpen(true)
              : handleAddToTeam(),
          disabled: isPending,
        }
      : undefined,
  };

  return {
    result,
    isPending,
    isConfirmationOpen,
    setIsConfirmationOpen,
    handleAddToTeam,
  };
};
