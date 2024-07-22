import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { Team } from "@opensystemslab/planx-core/types";
import navigation from "lib/navigation";
import React from "react";
import { Link } from "react-navi";
import { borderedFocusStyle } from "theme";
import { slugify } from "utils";

import { useStore } from "./FlowEditor/lib/store";
import { AddButton } from "./Team";

interface TeamTheme {
  slug: string;
  primaryColour: string;
}

interface Props {
  teams: Array<Team>;
  teamTheme: Array<TeamTheme>;
}

const StyledLink = styled(Link)(() => ({
  textDecoration: "none",
  "&:focus-within > div": {
    ...borderedFocusStyle,
  },
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
  const [canUserEditTeam, createTeam] = useStore((state) => [
    state.canUserEditTeam,
    state.createTeam,
  ]);

  const isPlatformAdmin = useStore.getState().getUser()?.isPlatformAdmin;

  const editableTeams: Team[] = [];
  const viewOnlyTeams: Team[] = [];

  teams.forEach((team) =>
    canUserEditTeam(team.slug)
      ? editableTeams.push(team)
      : viewOnlyTeams.push(team),
  );

  const renderTeams = (teamsToRender: Array<Team>) =>
    teamsToRender.map((team) => {
      return (
        <StyledLink href={`/${team.slug}`} key={team.slug} prefetch={false}>
          <TeamCard>
            <TeamColourBand bgcolor={team.theme.primaryColour} />
            <Typography p={2} variant="h3">
              {team.name}
            </Typography>
          </TeamCard>
        </StyledLink>
      );
    });
  return (
    <Container maxWidth="formWrap">
      <Box
        pb={1}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <Typography variant="h2" component="h1">
          Select a team
        </Typography>
        {isPlatformAdmin ? (
          <AddButton
            onClick={async () => {
              const newTeamName = prompt("Team name");

              if (newTeamName) {
                const newSlug = slugify(newTeamName);
                const teamSlugDuplicate = teams.find(
                  (team) => team.slug === newSlug,
                );
                if (teamSlugDuplicate !== undefined) {
                  alert(
                    `A team with the name "${teamSlugDuplicate.name}" already exists. Enter a unique team name to continue.`,
                  );
                } else {
                  await createTeam({
                    name: newTeamName,
                    slug: newSlug,
                  }).then(() => navigation.navigate(`/${newSlug}`));
                }
              }
            }}
          >
            Add a new team
          </AddButton>
        ) : null}
      </Box>
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
  );
};

export default Teams;
