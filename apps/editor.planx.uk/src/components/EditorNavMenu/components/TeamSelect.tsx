import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ButtonBase from "@planx/components/shared/Buttons/ButtonBase";
import { useStore } from "pages/FlowEditor/lib/store";
import { TeamSummary } from "pages/FlowEditor/lib/store/team";
import React, { useEffect, useMemo, useState } from "react";
import { useAppLoaderData } from "routes/_authenticated/app/route";
import { focusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";
import { SearchBox } from "ui/shared/SearchBox/SearchBox";

const StyledButtonBase = styled(ButtonBase)<{ teamcolor?: string }>(
  ({ theme, teamcolor }) => ({
    backgroundColor: theme.palette.background.default,
    width: "100%",
    borderLeft: `8px solid ${teamcolor || "OliveDrab"}`,
    borderRadius: 3,
    padding: theme.spacing(1, 0.5, 1, 1),
    justifyContent: "space-between",
    // TODO: standardise box shadow across nav menu items
    boxShadow: "0 1px 1.5px 0 rgba(0, 0, 0, 0.2)",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  border: "none",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1),
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

const StyledCard = styled(Card)<{ selected?: boolean; teamcolor?: string }>(
  ({ theme, teamcolor }) => ({
    backgroundColor: theme.palette.background.default,
    borderRadius: 3,
    borderLeft: `6px solid ${teamcolor || "OliveDrab"}`,
    padding: theme.spacing(0.75),
    boxShadow: "0 1px 1.5px 0 rgba(0, 0, 0, 0.2)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
    },
    "&:focus": focusStyle,
  }),
);

interface Props {
  currentTeamSlug: string;
  onTeamSelect: (teamSlug: string) => void;
}

export const TeamSelect: React.FC<Props> = ({
  currentTeamSlug,
  onTeamSelect,
}) => {
  const { teams } = useAppLoaderData();
  const [open, setOpen] = useState(false);
  const [canUserEditTeam] = useStore((state) => [state.canUserEditTeam]);
  const [searchedTeams, setSearchedTeams] = useState<TeamSummary[] | null>(
    null,
  );
  const [clearSearch, setClearSearch] = useState<boolean>(false);

  const viewOnlyTeams = useMemo(
    () => teams.filter((team) => !canUserEditTeam(team.slug)),
    [canUserEditTeam, teams],
  );

  const editableTeams = useMemo(
    () => teams.filter((team) => canUserEditTeam(team.slug)),
    [canUserEditTeam, teams],
  );

  const searchedEditableTeams = useMemo(
    () => searchedTeams?.filter((team) => canUserEditTeam(team.slug)) || [],
    [searchedTeams, canUserEditTeam],
  );

  const searchedViewOnlyTeams = useMemo(
    () => searchedTeams?.filter((team) => !canUserEditTeam(team.slug)) || [],
    [searchedTeams, canUserEditTeam],
  );

  const currentTeam = teams.find((team) => team.slug === currentTeamSlug);

  useEffect(() => {
    if (searchedTeams === teams && clearSearch) {
      setClearSearch(false);
    }
  }, [clearSearch, searchedTeams, teams]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleTeamClick = (teamSlug: string) => {
    onTeamSelect(teamSlug);
    handleClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent, teamSlug: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTeamClick(teamSlug);
    }
  };

  const displayEditableTeams = searchedTeams
    ? searchedEditableTeams
    : editableTeams;
  const displayViewOnlyTeams = searchedTeams
    ? searchedViewOnlyTeams
    : viewOnlyTeams;

  return (
    <>
      <StyledButtonBase
        onClick={handleOpen}
        selected={false}
        teamcolor={currentTeam?.theme.primaryColour}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.25,
            alignItems: "flex-start",
          }}
        >
          <Typography variant="body3" component="span" color="text.secondary">
            Team
          </Typography>
          <Typography
            variant="body3"
            component="span"
            color="text.primary"
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          >
            {currentTeam?.name || "Current team"}
          </Typography>
        </Box>
        <UnfoldMoreIcon sx={{ color: "text.secondary", fontSize: "1.5rem" }} />
      </StyledButtonBase>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        PaperProps={{
          sx: {
            position: "absolute",
            top: "65px",
            left: "5px",
            bottom: "65px",
            m: 0,
            width: "260px",
            maxWidth: "260px",
            minWidth: "unset",
            borderTop: "none",
            borderRadius: 3,
          },
        }}
      >
        <StyledDialogTitle>
          <Box>
            <Typography variant="h4" component="span">
              Select a team
            </Typography>
          </Box>
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
        <Box p={1} pb={1.5} pt={0}>
          <SearchBox
            records={teams}
            setRecords={setSearchedTeams}
            searchKey={["slug", "name"]}
            clearSearch={clearSearch}
            hideLabel={true}
            compact={true}
          />
          <Stack gap={2} pt={2}>
            {displayEditableTeams.length > 0 && (
              <Stack gap={1}>
                <Typography variant="body3" component="span">
                  My teams
                </Typography>
                <Stack gap={0.75}>
                  {displayEditableTeams.map((team) => (
                    <StyledCard
                      key={team.slug}
                      selected={team.slug === currentTeamSlug}
                      onClick={() => handleTeamClick(team.slug)}
                      onKeyDown={(e) => handleKeyDown(e, team.slug)}
                      teamcolor={team.theme.primaryColour}
                      tabIndex={0}
                      role="button"
                      aria-label={`Select ${team.name}`}
                    >
                      <Typography
                        variant="body3"
                        sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                      >
                        {team.name}
                      </Typography>
                      {team.slug === currentTeamSlug && (
                        <CheckCircleIcon
                          sx={(theme) => ({
                            color: theme.palette.info.main,
                            fontSize: "1em",
                          })}
                        />
                      )}
                    </StyledCard>
                  ))}
                </Stack>
              </Stack>
            )}
            {displayViewOnlyTeams.length > 0 && (
              <Stack gap={1}>
                <Typography variant="body3" component="span">
                  Other teams (view only)
                </Typography>
                <Stack gap={0.75}>
                  {displayViewOnlyTeams.map((team) => (
                    <StyledCard
                      key={team.slug}
                      onClick={() => handleTeamClick(team.slug)}
                      onKeyDown={(e) => handleKeyDown(e, team.slug)}
                      teamcolor={team.theme.primaryColour}
                      tabIndex={0}
                      role="button"
                      aria-label={`Select ${team.name}`}
                    >
                      <Typography
                        variant="body3"
                        sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
                      >
                        {team.name}
                      </Typography>
                    </StyledCard>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Box>
      </Dialog>
    </>
  );
};

export default TeamSelect;
