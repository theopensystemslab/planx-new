import { gql } from "@apollo/client";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import orderBy from "lodash/orderBy";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigation } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { slugify } from "utils";

import { client } from "../lib/graphql";
import SimpleMenu from "../ui/editor/SimpleMenu";
import { useStore } from "./FlowEditor/lib/store";
import { formatLastEditMessage } from "./FlowEditor/utils";

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.dark,
  color: "#fff",
  width: "100%",
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
}));

const Dashboard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.dark,
  color: "#fff",
  width: "100%",
  maxWidth: 600,
  margin: "auto",
  padding: theme.spacing(8, 0, 4, 0),
}));

const DashboardList = styled("ul")(({ theme }) => ({
  padding: theme.spacing(0, 0, 3),
  borderBottom: "1px solid #fff",
  margin: 0,
}));

const DashboardListItem = styled("li")(({ theme }) => ({
  listStyle: "none",
  position: "relative",
  padding: theme.spacing(2.5, 2),
}));

const DashboardLink = styled(Link)(({ theme }) => ({
  display: "block",
  fontSize: theme.typography.h4.fontSize,
  textDecoration: "none",
  color: "currentColor",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  marginBottom: theme.spacing(1.5),
  marginTop: 0,
}));

const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(1),
}));

const LinkSubText = styled(Box)(() => ({
  color: "#aaa",
  "& a": {
    color: "#fff",
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

const AddButtonRoot = styled(ButtonBase)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(4),
  fontSize: 20,
  backgroundColor: "rgba(255,255,255,0.25)",
  display: "block",
  textAlign: "left",
  marginTop: theme.spacing(2),
}));

function AddButton({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}): FCReturn {
  return (
    <AddButtonRoot onClick={onClick}>
      <Add sx={{ mr: 3, verticalAlign: "middle" }} /> {children}
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
        <Box pr={4}>
          <DashboardLink href={`./${flow.slug}`} prefetch={false}>
            {flow.slug}
          </DashboardLink>
          <LinkSubText>
            {formatLastEditMessage(
              flow.operations[0].createdAt,
              flow.operations[0]?.actor,
            )}
          </LinkSubText>
        </Box>
        {useStore.getState().canUserEditTeam(teamSlug) && (
          <StyledSimpleMenu
            items={[
              {
                onClick: async () => {
                  const newSlug = prompt("New name", flow.slug);
                  if (newSlug && slugify(newSlug) !== flow.slug) {
                    await client.mutate({
                      mutation: gql`
                        mutation UpdateFlowSlug(
                          $teamId: Int
                          $slug: String
                          $newSlug: String
                        ) {
                          update_flows(
                            where: {
                              team: { id: { _eq: $teamId } }
                              slug: { _eq: $slug }
                            }
                            _set: { slug: $newSlug }
                          ) {
                            affected_rows
                          }
                        }
                      `,
                      variables: {
                        teamId: teamId,
                        slug: flow.slug,
                        newSlug: slugify(newSlug),
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
    <Root>
      <Dashboard>
        <Box
          pl={2}
          pb={2}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h2" component="h1">
            My services
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
                useStore
                  .getState()
                  .createFlow(teamId, newFlowSlug)
                  .then((newId: string) => {
                    navigation.navigate(`/${slug}/${newId}`);
                  });
              }
            }}
          >
            Add a new service
          </AddButton>
        )}
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
      </Dashboard>
    </Root>
  );
};

export default Team;
