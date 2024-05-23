import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Team } from "@opensystemslab/planx-core/types";
import { HEADER_HEIGHT } from "components/Header";
import GlobalMenu from "pages/FlowEditor/components/GlobalMenu";
import React from "react";
import { Link } from "react-navi";

import { useStore } from "./FlowEditor/lib/store";

interface TeamTheme {
  slug: string;
  primaryColour: string;
  logo: string;
}

interface Props {
  teams: Array<Team>;
  teamTheme: Array<TeamTheme>;
}

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: "100%",
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
}));

const Dashboard = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "row",
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
}));

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
}));

const LogoWrap = styled(Box)(() => ({
  width: "90px",
  height: "50px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const TeamLogo = styled("img")(() => ({
  width: "100%",
  height: "100%",
  objectFit: "contain",
}));

const Teams: React.FC<Props> = ({ teams, teamTheme }) => {
  const canUserEditTeam = useStore.getState().canUserEditTeam;

  const editableTeams = teams.filter((team) => canUserEditTeam(team.slug));
  const viewOnlyTeams = teams.filter((team) => !canUserEditTeam(team.slug));

  const renderTeams = (teamsToRender: Array<Team>) =>
    teamsToRender.map(({ name, slug }) => {
      const theme = teamTheme.find((t) => t.slug === slug);
      const primaryColour = theme ? theme.primaryColour : "#000";
      const logo = theme ? theme.logo : "";

      return (
        <StyledLink href={`/${slug}`} key={slug} prefetch={false}>
          <Box
            mb={1}
            px={2}
            py={2}
            bgcolor={primaryColour}
            component={Card}
            color="common.white"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" component="h2">
              {name}
            </Typography>
            <LogoWrap>
              {logo && <TeamLogo src={logo} alt={`${name} logo`} />}
            </LogoWrap>
          </Box>
        </StyledLink>
      );
    });

  return (
    <Root>
      <Dashboard>
        <GlobalMenu />
        <Container maxWidth="formWrap">
          <Box py={4}>
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
                <Typography variant="h4" component="h2" mt={4} mb={2}>
                  Other teams (view only)
                </Typography>
                {renderTeams(viewOnlyTeams)}
              </>
            )}
          </Box>
        </Container>
      </Dashboard>
    </Root>
  );
};

export default Teams;
