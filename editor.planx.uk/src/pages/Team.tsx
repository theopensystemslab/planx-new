import { gql } from "@apollo/client";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
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
import { orderBy } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useCurrentRoute, useNavigation } from "react-navi";
import { inputFocusStyle } from "theme";
import { AddButton } from "ui/editor/AddButton";
import FlowTag, { FlowTagType, StatusVariant } from "ui/editor/FlowTag";
import { SortableFields, SortControl } from "ui/editor/SortControl";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";
import { slugify } from "utils";

import { client } from "../lib/graphql";
import SimpleMenu from "../ui/editor/SimpleMenu";
import { useStore } from "./FlowEditor/lib/store";
import { FlowSummary } from "./FlowEditor/lib/store/editor";
import { formatLastEditMessage } from "./FlowEditor/utils";

const DashboardList = styled("ul")(({ theme }) => ({
  padding: theme.spacing(3, 0),
  margin: 0,
  display: "grid",
  gridAutoRows: "1fr",
  gridTemplateColumns: "repeat(1, 1fr)",
  gridGap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "repeat(3, 1fr)",
  },
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

  const isPublished = Boolean(flow.publishedFlows[0]);
  const isSubmissionService =
    isPublished && flow.publishedFlows[0].hasSendComponent;

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
            {isSubmissionService && (
              <FlowTag
                tagType={FlowTagType.ServiceType}
                statusVariant={statusVariant}
              >
                {"Submission"}
              </FlowTag>
            )}
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
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.2 }}>
              <MoreHoriz sx={{ fontSize: "1.4em" }} />
              <Typography variant="body2" fontSize="small">
                <strong>Menu</strong>
              </Typography>
            </Box>
          </StyledSimpleMenu>
        )}
      </FlowCard>
    </>
  );
};

const GetStarted: React.FC<{ flows: FlowSummary[] }> = ({ flows }) => (
  <DashboardList sx={{ paddingTop: 0 }}>
    <FlowCard>
      <FlowCardContent>
        <Typography variant="h3">No services found</Typography>
        <Typography>Get started by creating your first service</Typography>
        <AddFlowButton flows={flows} />
      </FlowCardContent>
    </FlowCard>
  </DashboardList>
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
  const [triggerClearFilters, setTriggerClearFilters] =
    useState<boolean>(false);
  const route = useCurrentRoute();

  const haveFlowsBeenFiltered = filteredFlows?.length !== flows?.length;

  useEffect(() => {
    // resets trigger when filters cleared
    if (!haveFlowsBeenFiltered) {
      setTriggerClearFilters(false);
    }
  }, [haveFlowsBeenFiltered]);

  const sortOptions: SortableFields<FlowSummary>[] = [
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
    {
      displayName: "Name",
      fieldName: "name",
      directionNames: { asc: "A - Z", desc: "Z - A" },
    },
  ];
  const fetchFlows = useCallback(() => {
    const { sort, sortDirection } = route.url.query;
    getFlows(teamId).then((flows) => {
      // Copy the array and sort by most recently edited desc using last associated operation.createdAt, not flow.updatedAt
      if (sortDirection === "asc" || sortDirection === "desc") {
        const sortedFlows = orderBy(flows, sort, sortDirection);
        setFlows(sortedFlows);
        setFilteredFlows(sortedFlows);
      } else {
        const sortedFlows = orderBy(flows, sortOptions[0].fieldName, "asc");
        setFlows(sortedFlows);
        setFilteredFlows(sortedFlows);
      }
    });
  }, [teamId, setFlows, getFlows]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const teamHasFlows = filteredFlows && Boolean(filteredFlows.length);
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);

  const numberOfServices = filteredFlows?.length || 0;
  const pluralisedService = numberOfServices === 1 ? "service" : "services";
  const listTitle = haveFlowsBeenFiltered
    ? `Showing ${numberOfServices} ${pluralisedService}`
    : "Showing all services";

  return (
    <Box bgcolor={"background.paper"} flexGrow={1}>
      <Container maxWidth="lg">
        <Box
          pb={1}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", contentWrap: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", contentWrap: "center" },
            gap: 2,
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
          {flows && (
            <SearchBox<FlowSummary>
              records={filteredFlows || []}
              staticRecords={flows}
              setRecords={setFilteredFlows}
              searchKey={["name", "slug"]}
            />
          )}
        </Box>
        {teamHasFlows ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="h3" component="h2">
                  {listTitle}
                </Typography>
                {haveFlowsBeenFiltered && (
                  <Button
                    onClick={() => setTriggerClearFilters(true)}
                    variant="link"
                  >
                    Clear filters
                  </Button>
                )}
              </Box>
              {hasFeatureFlag("SORT_FLOWS") && flows && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="body2">
                    <strong>Sort by</strong>
                  </Typography>
                  <SortControl<FlowSummary>
                    records={filteredFlows}
                    setRecords={setFilteredFlows}
                    sortOptions={sortOptions}
                  />
                </Box>
              )}
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
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 2,
              minHeight: "50px",
            }}
          >
            <Typography variant="h3" textAlign="center">
              No results
            </Typography>
            <Button onClick={() => setTriggerClearFilters(true)} variant="link">
              Clear filters
            </Button>
          </Box>
        )}
        {flows && !flows.length && <GetStarted flows={flows} />}
      </Container>
    </Box>
  );
};

export default Team;
