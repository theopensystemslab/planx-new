import { gql, useQuery } from "@apollo/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import { isEmpty, orderBy } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useCurrentRoute, useNavigation } from "react-navi";
import { AddButton } from "ui/editor/AddButton";
import Filters from "ui/editor/Filter/Filter";
import { SortControl } from "ui/editor/SortControl/SortControl";
import { getSortParams } from "ui/editor/SortControl/utils";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";
import { slugify } from "utils";

import { useStore } from "../FlowEditor/lib/store";
import { FlowSummary } from "../FlowEditor/lib/store/editor";
import FlowCard, { Card, CardContent } from "./components/FlowCard";
import { ShowingServicesHeader } from "./components/ShowingServicesHeader";
import { filterOptions, sortOptions } from "./helpers/sortAndFilterOptions";
import {
  StartFromTemplateButton,
  TemplateOption,
} from "./StartFromTemplateButton";

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
  <DashboardList sx={{ paddingTop: 2 }}>
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

    const uniqueFlow = getUniqueFlow(newFlowName, flows);

    if (uniqueFlow) {
      const newId = await createFlow(teamId, uniqueFlow.slug, uniqueFlow.name);
      navigate(`/${teamSlug}/${newId}`);
    }
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
  const [searchedFlows, setSearchedFlows] = useState<FlowSummary[] | null>(
    null,
  );
  const [matchingFlows, setMatchingflows] = useState<FlowSummary[] | null>(
    null,
  );
  const [sortedFlows, setSortedFlows] = useState<FlowSummary[] | null>(null);

  const [shouldClearFilters, setShouldClearFilters] = useState<boolean>(false);

  const route = useCurrentRoute();

  useEffect(() => {
    const diffFlows =
      searchedFlows?.filter((flow) => filteredFlows?.includes(flow)) || null;

    // Sort the array at the start using the query params
    if (matchingFlows === null) {
      const {
        sortObject: { fieldName },
        sortDirection,
      } = getSortParams<FlowSummary>(route.url.query, sortOptions);
      const sortedFlows = orderBy(diffFlows, fieldName, sortDirection);
      setMatchingflows(sortedFlows);
    }

    setMatchingflows(diffFlows);

    if (shouldClearFilters) {
      setShouldClearFilters(false);
    }
  }, [searchedFlows, filteredFlows, shouldClearFilters]);

  const fetchFlows = useCallback(() => {
    getFlows(teamId).then((flows) => {
      // Copy the array and sort by most recently edited desc using last associated operation.createdAt, not flow.updatedAt
      setFlows(flows);
    });
  }, [teamId, setFlows, getFlows]);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const { data: templates } = useQuery<{ flows: TemplateOption[] }>(gql`
    query GetTemplates {
      flows(where: { is_template: { _eq: true } }) {
        id
        slug
        name
      }
    }
  `);

  const teamHasFlows = !isEmpty(flows) && flows;
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);
  const flowsHaveBeenFiltered = matchingFlows?.length !== flows?.length;
  const showAddTemplateButton =
    showAddFlowButton &&
    templates &&
    Boolean(templates?.flows.length) &&
    hasFeatureFlag("TEMPLATES");

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
          {teamHasFlows && (
            <SearchBox<FlowSummary>
              records={flows}
              setRecords={setSearchedFlows}
              searchKey={["name", "slug"]}
              clearSearch={shouldClearFilters}
            />
          )}
        </Box>
        {teamHasFlows && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              {showAddTemplateButton && (
                <StartFromTemplateButton templates={templates?.flows} />
              )}
            </Box>
            <Box>
              <Filters<FlowSummary>
                records={flows}
                setFilteredRecords={setFilteredFlows}
                filterOptions={filterOptions}
                clearFilters={shouldClearFilters}
              />
            </Box>
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
                <ShowingServicesHeader
                  matchedFlowsCount={matchingFlows?.length || 0}
                />
                {flowsHaveBeenFiltered && (
                  <Button
                    onClick={() => setShouldClearFilters(true)}
                    variant="link"
                  >
                    Clear filters
                  </Button>
                )}
              </Box>
              {teamHasFlows && matchingFlows && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography variant="body2">
                    <strong>Sort by</strong>
                  </Typography>
                  <SortControl<FlowSummary>
                    records={matchingFlows}
                    setRecords={setSortedFlows}
                    sortOptions={sortOptions}
                  />
                </Box>
              )}
            </Box>
            {sortedFlows && (
              <DashboardList>
                {sortedFlows.map((flow) => (
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
          </>
        )}
        {flows && !flows.length && <GetStarted flows={flows} />}
      </Container>
    </Box>
  );
};

export default Team;

const getUniqueFlow = (
  name: string,
  flows: FlowSummary[] | null,
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
