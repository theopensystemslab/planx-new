import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import { useToast } from "hooks/useToast";
import { SYSTEM_TEAMS } from "lib/systemTeams";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastEditMessage } from "pages/FlowEditor/utils";
import { useCreateFlow } from "pages/Flows/components/AddFlow/hooks/useCreateFlow";
import React from "react";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import { slugify } from "utils";

import { Badge } from "./Badge/Badge";
import { BadgeVariant } from "./Badge/types";
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
    flows(where: { id: { _eq: $id } }, limit: 1) {
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
    teamSlug,
    canUserEditTeam,
    showLoading,
    hideLoading,
    setLoadingCompleteCallback,
  ] = useStore((state) => [
    state.teamId,
    state.teamSlug,
    state.canUserEditTeam,
    state.showLoading,
    state.hideLoading,
    state.setLoadingCompleteCallback,
  ]);

  const { data } = useQuery<{ flows: TemplateDetails[] }>(
    GET_TEMPLATE_DETAILS,
    {
      variables: { id: template.id, systemTeams: SYSTEM_TEAMS },
      skip: !open,
    },
  );

  const details = data?.flows[0];
  const { mutate: createFlow, isPending } = useCreateFlow();

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

  const usedByCount = details?.usedByTeams.length ?? 0;

  return (
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Badge variant={BadgeVariant.SourceTemplate} size="compact" />
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {details?.team.name ?? template.team.name}
          </Typography>
        </Box>
        <Typography variant="h3" component="h2">
          {template.name}
        </Typography>
        {editMessage && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {editMessage}
          </Typography>
        )}
        {details?.publishedFlows[0]?.hasSendComponent && (
          <Box sx={{ mt: 1.5, display: "flex" }}>
            <FlowTag tagType={FlowTagType.ServiceType}>Submission</FlowTag>
          </Box>
        )}
        {template.summary && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            {template.summary}
          </Typography>
        )}
      </DialogContent>
      {usedByCount > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1.5 }}>
              {`Used by ${usedByCount} team${usedByCount === 1 ? "" : "s"}:`}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {details!.usedByTeams.map(({ team }) => (
                <Tooltip key={team.id} title={team.name}>
                  <span>
                    <Badge variant={BadgeVariant.Team} team={team} />
                  </span>
                </Tooltip>
              ))}
            </Box>
          </Box>
        </>
      )}
      <Divider />
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={onClose}>
          Close
        </Button>
        {canUserEditTeam(teamSlug) && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToTeam}
            disabled={isPending}
          >
            Add to my team
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
