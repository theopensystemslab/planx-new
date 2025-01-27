import { gql } from "@apollo/client";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link } from "react-navi";
import { inputFocusStyle } from "theme";
import FlowTag, { FlowTagType, StatusVariant } from "ui/editor/FlowTag";
import { slugify } from "utils";

import { client } from "../lib/graphql";
import SimpleMenu from "../ui/editor/SimpleMenu";
import { useStore } from "./FlowEditor/lib/store";
import { FlowSummary } from "./FlowEditor/lib/store/editor";
import { formatLastEditMessage } from "./FlowEditor/utils";

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
  padding: theme.spacing(2),
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

const Confirm = ({
  title,
  content,
  submitLabel,
  open,
  onClose,
  onConfirm,
}: {
  title: string;
  content: string;
  submitLabel: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <Dialog
    open={open}
    onClose={() => {
      onClose();
    }}
  >
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{content}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button onClick={onConfirm} color="primary">
        {submitLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

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
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = () => {
    useStore
      .getState()
      .deleteFlow(teamId, flow.slug)
      .then(() => {
        setDeleting(false);
        refreshFlows();
      });
  };
  const handleCopy = () => {
    useStore
      .getState()
      .copyFlow(flow.id)
      .then(() => {
        refreshFlows();
      });
  };
  const handleMove = (newTeam: string) => {
    useStore
      .getState()
      .moveFlow(flow.id, newTeam)
      .then(() => {
        refreshFlows();
      });
  };

  const isSubmissionService = flow.publishedFlows?.[0]?.hasSendComponent;

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
  ];

  return (
    <>
      {deleting && (
        <Confirm
          title="Confirm Delete"
          open={deleting}
          content="Deleting a service cannot be reversed."
          onClose={() => {
            setDeleting(false);
          }}
          onConfirm={handleDelete}
          submitLabel="Delete Service"
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
              (tag, index) =>
                tag.shouldAddTag && (
                  <FlowTag
                    key={index}
                    tagType={tag.type}
                    statusVariant={statusVariant}
                  >
                    {tag.displayName}
                  </FlowTag>
                ),
            )}
          </Box>
          <DashboardLink
            aria-label={flow.name}
            href={`./${flow.slug}`}
            prefetch={false}
          />
        </CardContent>
        {useStore.getState().canUserEditTeam(teamSlug) && (
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
                label: "Delete",
                onClick: () => {
                  setDeleting(true);
                },
                error: true,
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
