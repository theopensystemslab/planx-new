import { gql } from "@apollo/client";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { Link } from "react-navi";
import { inputFocusStyle } from "theme";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType, StatusVariant } from "ui/editor/FlowTag/types";
import { slugify } from "utils";
import { client } from "../../../lib/graphql";
import SimpleMenu from "../../../ui/editor/SimpleMenu";
import { useStore } from "../../FlowEditor/lib/store";
import { FlowSummary } from "../../FlowEditor/lib/store/editor";
import { formatLastEditMessage } from "../../FlowEditor/utils";
import { ArchiveDialog } from "./ArchiveDialog";

export const Card = styled("li")(({ theme }) => ({
  listStyle: "none",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "stretch",
  borderRadius: "3px",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.main}`,
  boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
}));

export const CardContent = styled(Box)(({ theme }) => ({
  position: "relative",
  height: "100%",
  textDecoration: "none",
  color: "currentColor",
  padding: theme.spacing(2, 2, 1),
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  margin: 0,
  width: "100%",
}));

const DashboardLink = styled(Link)(() => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  "&:focus": {
    ...inputFocusStyle,
  },
}));

const LinkSubText = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: "normal",
  paddingTop: theme.spacing(0.75),
}));

const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  display: "flex",
  marginTop: "auto",
  borderTop: `1px solid ${theme.palette.border.main}`,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  borderRadius: "0px 0px 4px 4px",
  "& > button": {
    padding: theme.spacing(0.25, 1),
    width: "100%",
    justifyContent: "flex-start",
    "& > svg": {
      display: "none",
    },
  },
}));

interface FlowCardProps {
  flow: FlowSummary;
  flows: FlowSummary[];
  teamId: number;
  teamSlug: string;
  refreshFlows: () => void;
}

const FlowCard: React.FC<FlowCardProps> = ({
  flow,
  flows,
  teamId,
  teamSlug,
  refreshFlows,
}) => {
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] =
    useState<boolean>(false);
  const [archiveFlow, copyFlow, moveFlow, canUserEditTeam] = useStore(
    (state) => [
      state.archiveFlow,
      state.copyFlow,
      state.moveFlow,
      state.canUserEditTeam,
    ],
  );

  const handleArchive = () => {
    archiveFlow(flow.id).then(() => {
      refreshFlows();
    });
  };
  const handleCopy = () => {
    copyFlow(flow.id).then(() => {
      refreshFlows();
    });
  };
  const handleMove = (newTeam: string) => {
    moveFlow(flow.id, newTeam, flow.name).then(() => {
      refreshFlows();
    });
  };

  const isSubmissionService = flow.publishedFlows?.[0]?.hasSendComponent;
  const isStatutoryApplicationType =
    flow.publishedFlows?.[0]?.isStatutoryApplicationType;

  const statusVariant =
    flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;

  const displayTags = [
    {
      type: FlowTagType.Status,
      displayName: statusVariant,
      shouldAddTag: true,
    },
    {
      type: FlowTagType.ServiceType,
      displayName: "Submission",
      shouldAddTag: isSubmissionService,
    },
    {
      type: FlowTagType.ApplicationType,
      displayName: "Statutory",
      shouldAddTag: isStatutoryApplicationType,
    },
  ];

  return (
    <>
      {isArchiveDialogOpen && (
        <ArchiveDialog
          title="Archive service"
          open={isArchiveDialogOpen}
          content={`Archiving this service will remove it from PlanX. Services can be restored by an admin`}
          onClose={() => {
            setIsArchiveDialogOpen(false);
          }}
          onConfirm={handleArchive}
          submitLabel="Archive Service"
        />
      )}
      <Card>
        <CardContent>
          <Box>
            <Typography variant="h3" component="h2">
              {flow.name}
            </Typography>
            <LinkSubText>
              {formatLastEditMessage(
                flow.operations[0]?.createdAt,
                flow.operations[0]?.actor,
              )}
            </LinkSubText>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {displayTags.map(
              (tag) =>
                tag.shouldAddTag && (
                  <FlowTag
                    key={`${tag.displayName}-flowtag`}
                    tagType={tag.type}
                    statusVariant={statusVariant}
                  >
                    {tag.displayName}
                  </FlowTag>
                ),
            )}
          </Box>
          {flow.summary && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ "& > a": { position: "relative", zIndex: 2 } }}
            >
              {`${flow.summary.split(" ").slice(0, 12).join(" ")}... `}
              <Link href={`./${flow.slug}/about`}>read more</Link>
            </Typography>
          )}
          <DashboardLink
            aria-label={flow.name}
            href={`./${flow.slug}`}
            prefetch={false}
          />
        </CardContent>
        {canUserEditTeam(teamSlug) && (
          <StyledSimpleMenu
            items={[
              {
                onClick: async () => {
                  const newName = prompt("New name", flow.name);
                  if (newName && newName !== flow.name) {
                    const newSlug = slugify(newName);
                    const duplicateFlowName = flows?.find(
                      (flow: any) => flow.slug === newSlug,
                    );
                    if (!duplicateFlowName) {
                      await client.mutate({
                        mutation: gql`
                          mutation UpdateFlowSlug(
                            $teamId: Int
                            $slug: String
                            $newSlug: String
                            $newName: String
                          ) {
                            update_flows(
                              where: {
                                team: { id: { _eq: $teamId } }
                                slug: { _eq: $slug }
                              }
                              _set: { slug: $newSlug, name: $newName }
                            ) {
                              affected_rows
                            }
                          }
                        `,
                        variables: {
                          teamId: teamId,
                          slug: flow.slug,
                          newSlug: newSlug,
                          newName: newName,
                        },
                      });

                      refreshFlows();
                    } else if (duplicateFlowName) {
                      alert(
                        `The flow "${newName}" already exists. Enter a unique flow name to continue`,
                      );
                    }
                  }
                },
                label: "Rename",
              },
              {
                label: "Copy",
                onClick: () => {
                  handleCopy();
                },
              },
              {
                label: "Move",
                onClick: () => {
                  const newTeam = prompt("New team");
                  if (newTeam) {
                    if (slugify(newTeam) === teamSlug) {
                      alert(
                        `This flow already belongs to ${teamSlug}, skipping move`,
                      );
                    } else {
                      handleMove(slugify(newTeam));
                    }
                  }
                },
              },
              {
                label: "Archive",
                onClick: () => setIsArchiveDialogOpen(true),
              },
            ]}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
              <MoreHoriz sx={{ fontSize: "1.4em" }} />
              <Typography variant="body2" fontSize="small">
                <strong>Menu</strong>
              </Typography>
            </Box>
          </StyledSimpleMenu>
        )}
      </Card>
    </>
  );
};

export default FlowCard;
