import { gql } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigation } from "react-navi";
import { inputFocusStyle } from "theme";
import { AddButton } from "ui/editor/AddButton";
import FlowTag, { FlowTagType, StatusVariant } from "ui/editor/FlowTag";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import { SortableFields, SortControl } from "ui/editor/SortControl";
import { slugify } from "utils";

import { client } from "../lib/graphql";
import SimpleMenu from "../ui/editor/SimpleMenu";
import Filters from "./Filters";
import { useStore } from "./FlowEditor/lib/store";
import { FlowSummary } from "./FlowEditor/lib/store/editor";
import { formatLastEditMessage } from "./FlowEditor/utils";

const DashboardList = styled("ul")(({ theme }) => ({
  padding: theme.spacing(3, 0),
  borderBottom: "1px solid #fff",
  margin: 0,
  display: "grid",
  gridAutoRows: "1fr",
  gridTemplateColumns: "1fr 1fr 1fr",
  gridGap: theme.spacing(2),
}));

const FlowCard = styled("li")(({ theme }) => ({
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

const FlowCardContent = styled(Box)(({ theme }) => ({
  position: "relative",
  height: "100%",
  textDecoration: "none",
  color: "currentColor",
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  margin: 0,
  width: "100%",
}));

const DashboardLink = styled(Link)(({ theme }) => ({
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

  const handleMove = (newTeam: string) => {
    useStore
      .getState()
      .moveFlow(flow.id, newTeam)
      .then(() => {
        refreshFlows();
      });
  };

  const statusVariant =
    flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;

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
      <FlowCard>
        <FlowCardContent>
          <Box>
            <Typography variant="h3" component="h2">
              {flow.name}
            </Typography>
            <LinkSubText>
              {formatLastEditMessage(
                flow.operations[0].createdAt,
                flow.operations[0]?.actor,
              )}
            </LinkSubText>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <FlowTag tagType={FlowTagType.Status} statusVariant={statusVariant}>
              {flow.status}
            </FlowTag>
          </Box>
          <DashboardLink href={`./${flow.slug}`} prefetch={false} />
          {flow.description && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ "& > a": { position: "relative", zIndex: 2 } }}
            >
              {`${flow.description.split(" ").slice(0, 10).join(" ")}... `}
              <Button
                variant="link"
                href="https://planx.uk"
                sx={{ minHeight: 0 }}
              >
                read more
              </Button>
            </Typography>
          )}
        </FlowCardContent>
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
          />
        )}
      </FlowCard>
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

const AddFlowButton: React.FC<{ flows: FlowSummary[] | null }> = ({
  flows,
}) => {
  const { navigate } = useNavigation();
  const { teamId, createFlow, teamSlug } = useStore();

  const addFlow = async () => {
    const newFlowName = prompt("Service name");
    if (!newFlowName) return;

    const newFlowSlug = slugify(newFlowName);
    const duplicateFlowName = flows?.find((flow) => flow.slug === newFlowSlug);

    if (duplicateFlowName) {
      alert(
        `The flow "${newFlowName}" already exists. Enter a unique flow name to continue`,
      );
      return;
    }

    const newId = await createFlow(teamId, newFlowSlug, newFlowName);
    navigate(`/${teamSlug}/${newId}`);
  };

  return <AddButton onClick={addFlow}>Add a new service</AddButton>;
};

const Team: React.FC = () => {
  const [{ id: teamId, slug }, canUserEditTeam, getFlows] = useStore(
    (state) => [state.getTeam(), state.canUserEditTeam, state.getFlows],
  );
  const [flows, setFlows] = useState<FlowSummary[] | null>(null);
  const [filteredFlows, setFilteredFlows] = useState<FlowSummary[] | null>(
    null,
  );

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
      setFilteredFlows(sortedFlows);
    });
  }, [teamId, setFlows, getFlows]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const teamHasFlows = filteredFlows && Boolean(filteredFlows.length);
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);

  const numberOfServices = filteredFlows?.length || 0;
  const pluralisedService = numberOfServices === 1 ? "service" : "services";
  const listTitle =
    filteredFlows === flows
      ? "Showing all services"
      : `Showing ${numberOfServices} ${pluralisedService}`;

  return (
    <Box bgcolor={"background.paper"} flexGrow={1}>
      <Container maxWidth="lg">
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
              gap: 2,
            }}
          >
            <Typography variant="h2" component="h1" pr={1}>
              Services
            </Typography>
            {/* {canUserEditTeam(slug) ? <Edit /> : <Visibility />} */}
            {showAddFlowButton && <AddFlowButton flows={flows} />}
          </Box>
          <Box maxWidth={360}>
            <InputRow>
              <InputRowLabel>
                <strong>Search</strong>
              </InputRowLabel>
              <InputRowItem>
                <Input
                  sx={{ borderColor: "black" }}
                  name="search"
                  id="search"
                />
              </InputRowItem>
            </InputRow>
          </Box>
        </Box>
        {hasFeatureFlag("SORT_FLOWS") && flows && (
        <SortControl<FlowSummary>
          records={flows}
          setRecords={setFlows}
          sortOptions={sortOptions}
        />
      )}
      {flows && <Filters flows={flows} setFilteredFlows={setFilteredFlows} />}
        {teamHasFlows && (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="h3" component="h2">
                {listTitle}
              </Typography>
              Order toggle
            </Box>

            <DashboardList>
              {filteredFlows.map((flow) => (
                <FlowItem
                  flow={flow}
                  flows={filteredFlows}
                  key={flow.slug}
                  teamId={teamId}
                  teamSlug={slug}
                  refreshFlows={() => {
                    fetchFlows();
                  }}
                />
              ))}
            </DashboardList>
          </>
        )}
        {flows && !flows.length && <GetStarted flows={flows} />}
      </Container>
    </Box>
  );
};

export default Team;
