import { gql } from "@apollo/client";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { borderedFocusStyle } from "theme";
import { slugify } from "utils";

import { client } from "../lib/graphql";
import SimpleMenu from "../ui/editor/SimpleMenu";
import { useStore } from "./FlowEditor/lib/store";
import { formatLastEditMessage } from "./FlowEditor/utils";

const DashboardList = styled("ul")(({ theme }) => ({
  padding: theme.spacing(0, 0, 3),
  borderBottom: "1px solid #fff",
  margin: 0,
}));

const DashboardListItem = styled("li")(({ theme }) => ({
  listStyle: "none",
  position: "relative",
  color: theme.palette.common.white,
  margin: theme.spacing(1, 0),
  background: theme.palette.text.primary,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "stretch",
  borderRadius: "2px",
}));

const DashboardLink = styled(Link)(({ theme }) => ({
  display: "block",
  fontSize: theme.typography.h4.fontSize,
  textDecoration: "none",
  color: "currentColor",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  padding: theme.spacing(2),
  margin: 0,
  width: "100%",
  "&:focus-within": {
    ...borderedFocusStyle,
  },
}));

const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  display: "flex",
  borderLeft: `1px solid ${theme.palette.border.main}`,
}));

const LinkSubText = styled(Box)(({ theme }) => ({
  color: theme.palette.grey[400],
  fontWeight: "normal",
  paddingTop: "0.5em",
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

const AddButtonRoot = styled(ButtonBase)(({ theme }) => ({
  fontSize: 20,
  display: "flex",
  alignItems: "center",
  textAlign: "left",
  color: theme.palette.primary.main,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

export function AddButton({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}): FCReturn {
  return (
    <AddButtonRoot onClick={onClick}>
      <AddCircleOutlineIcon sx={{ mr: 1 }} /> {children}
    </AddButtonRoot>
  );
}

interface FlowItemProps {
  flow: any;
  teamId: number;
  teamSlug: string;
  refreshFlows: () => void;
}

const FlowItem: React.FC<FlowItemProps> = ({
  flow,
  teamId,
  teamSlug,
  refreshFlows,
}) => {
  const [deleting, setDeleting] = useState(false);
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
      <DashboardListItem>
        <DashboardLink href={`./${flow.slug}`} prefetch={false}>
          <Typography variant="h4" component="h2">
            {flow.name}
          </Typography>
          <LinkSubText>
            {formatLastEditMessage(
              flow.operations[0].createdAt,
              flow.operations[0]?.actor,
            )}
          </LinkSubText>
        </DashboardLink>
        {useStore.getState().canUserEditTeam(teamSlug) && (
          <StyledSimpleMenu
            items={[
              {
                onClick: async () => {
                  const newName = prompt("New name", flow.name);
                  if (newName && newName !== flow.name) {
                    const newSlug = slugify(newName);
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
          />
        )}
      </DashboardListItem>
    </>
  );
};

const Team: React.FC = () => {
  const { id: teamId, slug } = useStore((state) => state.getTeam());
  const [flows, setFlows] = useState<any[] | null>(null);
  const navigation = useNavigation();

  const fetchFlows = useCallback(() => {
    useStore
      .getState()
      .getFlows(teamId)
      .then((res: { flows: any[] }) => {
        // Copy the array and sort by most recently edited desc using last associated operation.createdAt, not flow.updatedAt
        const sortedFlows = res.flows.toSorted((a, b) =>
          b.operations[0]["createdAt"].localeCompare(
            a.operations[0]["createdAt"],
          ),
        );
        setFlows(sortedFlows);
      });
  }, [teamId, setFlows]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  return (
    <Container maxWidth="formWrap">
      <Box
        pb={1}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Typography variant="h2" component="h1" pr={1}>
            Services
          </Typography>
          {useStore.getState().canUserEditTeam(slug) ? (
            <Edit />
          ) : (
            <Visibility />
          )}
        </Box>
        {useStore.getState().canUserEditTeam(slug) && (
          <AddButton
            onClick={() => {
              const newFlowName = prompt("Service name");
              if (newFlowName) {
                const newFlowSlug = slugify(newFlowName);
                const duplicateFlowName = flows?.find(
                  (flow) => flow.slug === newFlowSlug,
                );

                !duplicateFlowName
                  ? useStore
                      .getState()
                      .createFlow(teamId, newFlowSlug, newFlowName)
                      .then((newId: string) => {
                        navigation.navigate(`/${slug}/${newId}`);
                      })
                  : alert(
                      `The flow "${newFlowName}" already exists. Enter a unique flow name to continue`,
                    );
              }
            }}
          >
            Add a new service
          </AddButton>
        )}
      </Box>
      {flows && (
        <DashboardList>
          {flows.map((flow: any) => (
            <FlowItem
              flow={flow}
              key={flow.slug}
              teamId={teamId}
              teamSlug={slug}
              refreshFlows={() => {
                fetchFlows();
              }}
            />
          ))}
        </DashboardList>
      )}
    </Container>
  );
};

export default Team;
