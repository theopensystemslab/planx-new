import { gql, useQuery } from "@apollo/client";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigation } from "react-navi";
import { borderedFocusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";
import { AddButton } from "ui/editor/AddButton";
import { SortableFields, SortControl } from "ui/editor/SortControl";
import { slugify } from "utils";

import FlowCard, { Card, CardContent } from "./FlowCard";
import { useStore } from "./FlowEditor/lib/store";
import { FlowSummary } from "./FlowEditor/lib/store/editor";
import { client } from "../../lib/graphql";
import SimpleMenu from "../../ui/editor/SimpleMenu";
import { useStore } from "../FlowEditor/lib/store";
import { FlowSummary } from "../FlowEditor/lib/store/editor";
import { formatLastEditMessage } from "../FlowEditor/utils";
import { ArchiveDialog } from "./components/ArchiveDialog";
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

const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  display: "flex",
  borderLeft: `1px solid ${theme.palette.border.main}`,
}));

const LinkSubText = styled(Box)(({ theme }) => ({
  color: theme.palette.grey[400],
  fontWeight: "normal",
  paddingTop: "0.5em",
}));

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
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState<boolean>(false);
  const [archiveFlow, copyFlow, moveFlow, canUserEditTeam] = useStore((state) => [
    state.archiveFlow,
    state.copyFlow,
    state.moveFlow,
    state.canUserEditTeam
  ]);

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
  const handleMove = (newTeam: string, flowName: string) => {
    moveFlow(flow.id, newTeam, flowName).then(() => {
      refreshFlows();
    });
  };

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
        {canUserEditTeam(teamSlug) && (
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
                    "Enter the destination team's slug. A slug is the URL name of a team, for example 'Barking & Dagenham' would be 'barking-and-dagenham'. ",
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
                label: "Archive",
                onClick: () => setIsArchiveDialogOpen(true),
              },
            ]}
          />
        )}
      </DashboardListItem>
    </>
  );
};

const GetStarted: React.FC<{ flows: FlowSummary[] }> = ({ flows }) => (
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

  const { data: templates } = useQuery<{ flows: TemplateOption[] }>(gql`
    query GetTemplates {
      flows(where: { is_template: { _eq: true } }) {
        id
        slug
        name
      }
    }
  `);

  const teamHasFlows = flows && Boolean(flows.length);
  const showAddFlowButton = teamHasFlows && canUserEditTeam(slug);
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          {showAddFlowButton && <AddFlowButton flows={flows} />}
          {showAddTemplateButton && (
            <StartFromTemplateButton templates={templates.flows} />
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
