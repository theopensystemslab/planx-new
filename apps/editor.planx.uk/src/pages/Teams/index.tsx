import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { usePermission } from "hooks/usePermission";
import type { TeamSummary } from "pages/FlowEditor/lib/store/team";
import React from "react";
import { focusStyle } from "theme";
import { InfoChip } from "ui/editor/InfoChip";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

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
  const isPlatformAdmin = usePermission(["platformAdmin"]);

  const renderTeams = (teamsToRender: Array<TeamSummary>) =>
    teamsToRender.map((team) => {
      return (
        <StyledLink
          to="/app/$team"
          params={{ team: team.slug }}
          key={team.slug}
        >
          <TeamCard>
            <Box sx={{ display: "flex" }}>
              <TeamColourBand sx={{ bgcolor: team.theme?.primaryColour }} />
              <Typography sx={{ p: 2 }} variant="h3">
                {team.name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {team.settings?.isTrial && <InfoChip label="Trial account" />}
              {isPlatformAdmin && team.settings?.isGuidanceOnly && (
                <InfoChip
                  label="Guidance only"
                  sx={{
                    backgroundColor: "info.main",
                    color: "info.contrastText",
                  }}
                />
              )}
            </Box>
          </TeamCard>
        </StyledLink>
      );
    });

  return (
    <Container maxWidth="formWrap">
      <Box
        sx={{
          pb: 1,
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
      {renderTeams(teams)}
    </Container>
  );
};

export default Teams;
