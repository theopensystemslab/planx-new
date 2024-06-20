import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Team } from "@opensystemslab/planx-core/types";
import React from "react";
import { Link } from "react-navi";
import Dashboard from "ui/editor/Dashboard";

import { useStore } from "./FlowEditor/lib/store";

interface TeamTheme {
  slug: string;
  primaryColour: string;
}

interface Props {
  teams: Array<Team>;
  teamTheme: Array<TeamTheme>;
}

export const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: "100%",
  display: "flex",
  alignItems: "flex-start",
  flexGrow: 1,
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));

const TeamCard = styled(Card)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  outline: `1px solid ${theme.palette.border.light}`,
  outlineOffset: "-1px",
  borderRadius: "1px",
}));

const TeamColourBand = styled(Box)(({ theme }) => ({
  display: "flex",
  alignSelf: "stretch",
  width: theme.spacing(1.5),
  zIndex: 1,
}));

const Teams: React.FC<Props> = ({ teams, teamTheme }) => {
  const canUserEditTeam = useStore.getState().canUserEditTeam;

  const editableTeams = teams.filter((team) => canUserEditTeam(team.slug));
  const viewOnlyTeams = teams.filter((team) => !canUserEditTeam(team.slug));

  const renderTeams = (teamsToRender: Array<Team>) =>
    teamsToRender.map(({ name, slug }) => {
      const theme = teamTheme.find((t) => t.slug === slug);
      const primaryColour = theme ? theme.primaryColour : "#000";

      return (
        <StyledLink href={`/${slug}`} key={slug} prefetch={false}>
          <TeamCard>
            <TeamColourBand bgcolor={primaryColour} />
            <Typography p={2} variant="h3">
              {name}
            </Typography>
          </TeamCard>
        </StyledLink>
      );
    });
  return (
    <Root>
      <Dashboard>
        <Container maxWidth="formWrap">
          <Typography variant="h2" component="h1" mb={4}>
            Select a team
          </Typography>
          {editableTeams.length > 0 && (
            <>
              <Typography variant="h3" component="h2" mb={2}>
                My teams
              </Typography>
              {renderTeams(editableTeams)}
            </>
          )}

          {viewOnlyTeams.length > 0 && (
            <>
              <Typography variant="h3" component="h2" mt={4} mb={2}>
                Other teams (view only)
              </Typography>
              {renderTeams(viewOnlyTeams)}
            </>
          )}
        </Container>
      </Dashboard>
    </Root>
  );
};

export default Teams;
