import { gql } from "@apollo/client";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigation } from "react-navi";
import { borderedFocusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";
import { AddButton } from "ui/editor/AddButton";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import { SortableFields, SortControl } from "ui/editor/SortControl";
import InputLabel from "ui/public/InputLabel";
import { slugify } from "utils";

import { client } from "../lib/graphql";
import SimpleMenu from "../ui/editor/SimpleMenu";
import { useStore } from "./FlowEditor/lib/store";
import { FlowSummary } from "./FlowEditor/lib/store/editor";
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

interface FlowItemProps {
  flow: FlowSummary;
  flows: FlowSummary[];
  teamId: number;
  teamSlug: string;
  refreshFlows: () => void;
}

const FlowItem: React.FC<FlowItemProps> = ({
  flow,
  flows,
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
  const handleMove = (newTeam: string, flowName: string) => {
    useStore
      .getState()
      .moveFlow(flow.id, newTeam, flowName)
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
                    const uniqueFlow = getUniqueFlow(newName, flows);
                    if (uniqueFlow) {
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
                          newSlug: uniqueFlow.slug,
                          newName: uniqueFlow.name,
                        },
                      });

                      refreshFlows();
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
                  const newTeam = prompt(
                    "Add the new team's slug. A slug is a way to represent a team name, for example 'Barking & Dagenham' would be 'barking-and-dagenham'. ",
                  );
                  if (newTeam) {
                    if (slugify(newTeam) === teamSlug) {
                      alert(
                        `This flow already belongs to ${teamSlug}, skipping move`,
                      );
                    } else {
                      handleMove(slugify(newTeam), flow.name);
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

const GetStarted: React.FC<{ flows: FlowSummary[] }> = ({ flows }) => (
  <Box
    sx={(theme) => ({
      mt: 4,
      backgroundColor: theme.palette.background.paper,
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      padding: 2,
    })}
  >
    <Typography variant="h3">No services found</Typography>
    <Typography>Get started by creating your first service</Typography>
    <AddFlowButton flows={flows} />
  </Box>
);

const AddFlowButton: React.FC<{ flows: FlowSummary[] }> = ({ flows }) => {
  const { navigate } = useNavigation();
  const { teamId, createFlow, teamSlug } = useStore();

  const addFlow = async () => {
    const newFlowName = prompt("Service name");
    if (!newFlowName) return;

    const uniqueFlow = getUniqueFlow(newFlowName, flows);

    if (uniqueFlow) {
      const newId = await createFlow(teamId, uniqueFlow.slug, uniqueFlow.name);
      navigate(`/${teamSlug}/${newId}`);
    }
  };

  return <AddButton onClick={addFlow}>Add a new service</AddButton>;
};

const StartFromTemplateButton: React.FC<{}> = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // TODO fetch flows marked as "source templates"
  const mockTemplateOptions = [
    {
      id: "123-456",
      name: "Apply for planning permission",
      slug: "apply-for-planning-permission",
    },
    {
      id: "789-123",
      name: "Apply for a lawful development certificate",
      slug: "apply-for-a-lawful-development-certificate",
    },
  ];

  return (
    <Box mt={1}>
      <AddButton onClick={() => setDialogOpen(true)}>
        Start from a template
      </AddButton>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="md"
      >
        <DialogTitle variant="h3" component="h1">
          {`Start from a template`}
        </DialogTitle>
        <DialogContent>
          {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent dictum interdum tellus laoreet faucibus. Aliquam ultricies vitae nunc non efficitur. Mauris leo nulla, luctus sit amet ullamcorper a, porta at mauris. Integer nec elit a magna dapibus bibendum.`}
          <Box mt={2}>
            <InputLabel
              label="Available templates"
              id={`select-label-templates`}
            >
              <SelectInput
                bordered
                required={true}
                title={"Available templates"}
                labelId={`select-label-templates`}
                value={mockTemplateOptions[0].slug}
                onChange={() => console.log("TODO formik?")}
                name={"templates"}
              >
                {mockTemplateOptions.map((option) => (
                  <MenuItem key={option.id} value={option.slug}>
                    {option.name}
                  </MenuItem>
                ))}
              </SelectInput>
            </InputLabel>
          </Box>
        </DialogContent>
        <DialogActions sx={{ paddingX: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>BACK</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => console.log("TODO create template")}
          >
            CREATE TEMPLATE
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const Team: React.FC = () => {
  const [{ id: teamId, slug }, canUserEditTeam, getFlows] = useStore(
    (state) => [state.getTeam(), state.canUserEditTeam, state.getFlows],
  );
  const [flows, setFlows] = useState<FlowSummary[] | null>(null);

  const sortOptions: SortableFields<FlowSummary>[] = [
    {
      displayName: "Name",
      fieldName: "name",
      directionNames: { asc: "A - Z", desc: "Z - A" },
    },
    {
      displayName: "Last updated",
      fieldName: "updatedAt",
      directionNames: { asc: "Oldest first", desc: "Newest first" },
    },
    {
      displayName: "Last published",
      fieldName: `publishedFlows.0.publishedAt`,
      directionNames: { asc: "Oldest first", desc: "Newest first" },
    },
  ];
  const fetchFlows = useCallback(() => {
    getFlows(teamId).then((flows) => {
      // Copy the array and sort by most recently edited desc using last associated operation.createdAt, not flow.updatedAt
      const sortedFlows = flows.toSorted((a, b) =>
        b.operations[0]["createdAt"].localeCompare(
          a.operations[0]["createdAt"],
        ),
      );
      setFlows(sortedFlows);
    });
  }, [teamId, setFlows, getFlows]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const teamHasFlows = flows && Boolean(flows.length);
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);

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
          {canUserEditTeam(slug) ? <Edit /> : <Visibility />}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          {showAddFlowButton && <AddFlowButton flows={flows} />}
          {showAddFlowButton && hasFeatureFlag("TEMPLATES") && (
            <StartFromTemplateButton />
          )}
        </Box>
      </Box>
      {hasFeatureFlag("SORT_FLOWS") && flows && (
        <SortControl<FlowSummary>
          records={flows}
          setRecords={setFlows}
          sortOptions={sortOptions}
        />
      )}
      {teamHasFlows && (
        <DashboardList>
          {flows.map((flow) => (
            <FlowItem
              flow={flow}
              flows={flows}
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
      {flows && !flows.length && <GetStarted flows={flows} />}
    </Container>
  );
};

export default Team;

const getUniqueFlow = (
  name: string,
  flows: FlowSummary[],
): { slug: string; name: string } | undefined => {
  const newFlowSlug = slugify(name);
  const duplicateFlowName = flows?.find((flow) => flow.slug === newFlowSlug);

  if (duplicateFlowName) {
    const updatedName = prompt(
      `A service already exists with the name '${name}', enter another name`,
      name,
    );
    if (!updatedName) return;
    return getUniqueFlow(updatedName, flows);
  }
  return { slug: newFlowSlug, name: name };
};
