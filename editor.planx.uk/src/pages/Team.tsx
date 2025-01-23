import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import { isEmpty } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "react-navi";
import { AddButton } from "ui/editor/AddButton";
import { SortableFields, SortControl } from "ui/editor/SortControl";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
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
          <Box maxWidth={360}>
            <InputRow>
              <InputRowLabel>
                <strong>Search</strong>
              </InputRowLabel>
              <InputRowItem>
                <Box sx={{ position: "relative" }}>
                  <Input
                    sx={{
                      borderColor: (theme) => theme.palette.border.input,
                      pr: 5,
                    }}
                    name="search"
                    id="search"
                  />
                </Box>
              </InputRowItem>
            </InputRow>
          </Box>
        </Box>
        <Box>
          {hasFeatureFlag("SORT_FLOWS") && flows && (
            <SortControl<FlowSummary>
              records={flows}
              setRecords={setFlows}
              sortOptions={sortOptions}
            />
          )}
        </Box>
        <Box>
          {teamHasFlows && (
            <DashboardList>
              {flows.map((flow) => (
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
        </Box>
      </Container>
    </Box>
  );
};

export default Team;
