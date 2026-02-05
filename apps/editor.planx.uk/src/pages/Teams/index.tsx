import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useMemo, useState } from "react";
import { TeamSummary } from "routes/_authenticated/index";
import { focusStyle } from "theme";
import { InfoChip } from "ui/editor/InfoChip";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

import { useStore } from "../FlowEditor/lib/store";
import { AddTeamButton } from "./AddTeamButton";
interface Props {
  teams: Array<TeamSummary>;
}

const StyledLink = styled(CustomLink)(() => ({
  textDecoration: "none",
  display: "block",
  "&:focus, &:focus-within > div": focusStyle,
})) as typeof CustomLink;

const TeamCard = styled(Card)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  outline: `1px solid ${theme.palette.border.light}`,
  outlineOffset: "-1px",
  borderRadius: "1px",
  paddingRight: theme.spacing(2),
}));

const TeamColourBand = styled(Box)(({ theme }) => ({
  display: "flex",
  alignSelf: "stretch",
  width: theme.spacing(1.5),
  zIndex: 1,
}));

const Teams: React.FC<Props> = ({ teams }) => {
  const [canUserEditTeam] = useStore((state) => [state.canUserEditTeam]);

  const [searchedTeams, setSearchedTeams] = useState<TeamSummary[] | null>(
    null,
  );
  const [clearSearch, setClearSearch] = useState<boolean>(false);

  const viewOnlyTeams = useMemo(
    () => teams.filter((team) => !canUserEditTeam(team.slug)),
    [canUserEditTeam, teams],
  );

  const editableTeams: TeamSummary[] = teams.filter((team) =>
    canUserEditTeam(team.slug),
  );

  useEffect(() => {
    if (searchedTeams === viewOnlyTeams && clearSearch) {
      setClearSearch(false);
    }
  }, [clearSearch, searchedTeams, viewOnlyTeams]);

  const renderTeams = (teamsToRender: Array<TeamSummary>) =>
    teamsToRender.map((team) => {
      return (
        <StyledLink
          to="/team/$team"
          params={{ team: team.slug }}
          key={team.slug}
        >
          <TeamCard>
            <Box sx={{ display: "flex" }}>
              <TeamColourBand bgcolor={team.theme.primaryColour} />
              <Typography p={2} variant="h3">
                {team.name}
              </Typography>
            </Box>
            {team.settings.isTrial && <InfoChip label="Trial account" />}
          </TeamCard>
        </StyledLink>
      );
    });

  const NoResultsCard = (
    <Card>
      <CardContent>
        <Typography variant="h3">No results</Typography>
        <Typography pt={1}>Check your search term and try again</Typography>
        <Button variant="link" onClick={() => setClearSearch(true)}>
          Clear search
        </Button>
      </CardContent>
    </Card>
  );

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
        <AddTeamButton />
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
          <Box
            pb={1}
            mt={4}
            sx={{
              display: "flex",
              flexDirection: { xs: "column", contentWrap: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "center", contentWrap: "center" },
              gap: 2,
            }}
          >
            <Typography
              variant="h3"
              component="h2"
              mt={2}
              mb={2}
              sx={{ textWrap: "nowrap" }}
            >
              Other teams (view only)
            </Typography>
            <SearchBox
              records={viewOnlyTeams}
              setRecords={setSearchedTeams}
              searchKey={["slug", "name"]}
              clearSearch={clearSearch}
              hideLabel={true}
            />
          </Box>

          {searchedTeams?.length ? renderTeams(searchedTeams) : NoResultsCard}
        </>
      )}
    </Container>
  );
};

export default Teams;
