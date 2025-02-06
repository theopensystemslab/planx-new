import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import { isEmpty } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "react-navi";
import { AddButton } from "ui/editor/AddButton";
import Filters, { FilterOptions } from "ui/editor/Filter/Filter";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import { SortableFields, SortControl } from "ui/editor/SortControl";
import InputLabel from "ui/public/InputLabel";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";
import { slugify } from "utils";

import FlowCard, { Card, CardContent } from "./FlowCard";
import { useStore } from "./FlowEditor/lib/store";
import { FlowSummary } from "./FlowEditor/lib/store/editor";

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

const GetStarted: React.FC<{ flows: FlowSummary[] | null }> = ({ flows }) => (
  <DashboardList sx={{ paddingTop: 0 }}>
    <Card>
      <CardContent>
        <Typography variant="h3">No services found</Typography>
        <Typography>Get started by creating your first service</Typography>
        <AddFlowButton flows={flows} />
      </CardContent>
    </Card>
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
  const [filteredFlows, setFilteredFlows] = useState<FlowSummary[] | null>(
    null,
  );
  const [searchedFlows, setSearchedFlows] = useState<FlowSummary[] | null>(
    null,
  );
  const [matchingFlows, setMatchingflows] = useState<FlowSummary[] | null>(
    null,
  );

  useEffect(() => {
    const diffFlows =
      searchedFlows?.filter((flow) => filteredFlows?.includes(flow)) || null;
    setMatchingflows(diffFlows);
  }, [searchedFlows, filteredFlows]);

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

  const checkFlowStatus: FilterOptions<FlowSummary>["validationFn"] = (
    flow,
    value,
  ) => flow.status === value;

  const checkFlowServiceType: FilterOptions<FlowSummary>["validationFn"] = (
    flow,
    _value,
  ) => flow.publishedFlows[0]?.hasSendComponent;

  const checkFlowApplicationType: FilterOptions<FlowSummary>["validationFn"] = (
    flow,
    _value,
  ) => flow.publishedFlows[0]?.isStatutoryApplicationType;

  const filterOptions: FilterOptions<FlowSummary>[] = [
    {
      displayName: "Online status",
      optionKey: "status",
      optionValue: ["online", "offline"],
      validationFn: checkFlowStatus,
    },
    {
      displayName: "Service type",
      optionKey: `publishedFlows.0.hasSendComponent`,
      optionValue: ["submission"],
      validationFn: checkFlowServiceType,
    },
    {
      displayName: "Application type",
      optionKey: `name`,
      optionValue: ["statutory"],
      validationFn: checkFlowApplicationType,
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
      setSearchedFlows(sortedFlows);
    });
  }, [teamId, setFlows, getFlows]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const teamHasFlows = !isEmpty(filteredFlows) && !isEmpty(flows);
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);

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
            {showAddFlowButton && <AddFlowButton flows={flows} />}
          </Box>
          {hasFeatureFlag("SORT_FLOWS") && flows && (
            <SearchBox<FlowSummary>
              records={flows}
              setRecords={setSearchedFlows}
              searchKey={["name", "slug"]}
            />
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          {showAddFlowButton && hasFeatureFlag("TEMPLATES") && (
            <StartFromTemplateButton />
          )}
        </Box>
        <Box>
          {filteredFlows && flows && (
            <Filters<FlowSummary>
              records={flows}
              setFilteredRecords={setFilteredFlows}
              filterOptions={filterOptions}
            />
          )}
          {hasFeatureFlag("SORT_FLOWS") && flows && (
            <SortControl<FlowSummary>
              records={flows}
              setRecords={setFlows}
              sortOptions={sortOptions}
            />
          )}
        </Box>
        {matchingFlows && flows && (
          <DashboardList>
            {matchingFlows.map((flow) => (
              <FlowCard
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
    </Box>
  );
};

export default Team;
