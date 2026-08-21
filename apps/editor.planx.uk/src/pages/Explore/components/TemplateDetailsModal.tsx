import { gql, useQuery } from "@apollo/client";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import { useToast } from "hooks/useToast";
import { SYSTEM_TEAMS } from "lib/systemTeams";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastEditMessage } from "pages/FlowEditor/utils";
import { useCreateFlow } from "pages/Flows/components/AddFlow/hooks/useCreateFlow";
import React, { useState } from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import { slugify } from "utils";

import { Badge } from "./Badge/Badge";
import { BadgeVariant } from "./Badge/types";
import { SearchListItemDetail } from "./SearchListItemDetail";
import { SearchListItemDetailActions } from "./SearchListItemDetailActions";
import type { SearchResult } from "./SearchResult";
import type { Template } from "./types";

interface TemplateDetails {
  team: { name: string };
  operations: {
    createdAt: string;
    actor?: { firstName: string; lastName: string };
  }[];
  publishedFlows: { hasSendComponent: boolean }[];
  usedByTeams: {
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
        hasSendComponent: has_send_component
      }
      usedByTeams: templated_flows(
        distinct_on: team_id
        order_by: [{ team_id: asc }, { created_at: desc }]
        where: { team: { slug: { _nin: $systemTeams } } }
      ) {
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

interface TemplateDetailsModalProps {
  template: Template;
  open: boolean;
  onClose: () => void;
}

export const TemplateDetailsModal: React.FC<TemplateDetailsModalProps> = ({
  template,
  open,
  onClose,
}) => {
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
      skip: !open,
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
          onClose();
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
              icon: <Badge variant={BadgeVariant.Team} team={team} />,
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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="formWrap"
        slotProps={{
          paper: {
            sx: (theme) => ({ maxWidth: theme.breakpoints.values.formWrap }),
          },
        }}
      >
        <DialogContent sx={{ backgroundColor: "background.default" }}>
          <SearchListItemDetail result={result} />
        </DialogContent>
        <SearchListItemDetailActions
          primaryAction={result.primaryAction}
          onClose={onClose}
        />
      </Dialog>
      <ConfirmationDialog
        open={isConfirmationOpen}
        onClose={(confirmed) => {
          setIsConfirmationOpen(false);
          if (confirmed) handleAddToTeam();
        }}
        title="Add template to your team?"
        confirmText="Continue"
        cancelText="Cancel"
      >
        <Typography>
          You already subscribe to this template, subscribing again would mean
          maintaining more than one instance of this template.
        </Typography>
      </ConfirmationDialog>
    </>
  );
};
