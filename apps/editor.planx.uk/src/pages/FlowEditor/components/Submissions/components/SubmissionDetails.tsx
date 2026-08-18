import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { useTeamLogo } from "../hooks";
import type { Submission } from "../types";

type Props = {
  sessionId: string;
  latestEvent: Submission;
  teamSlug: string;
};

export const SubmissionDetails: React.FC<Props> = (props) => {
  const { data } = useTeamLogo(props.teamSlug);
  const teamLogo = data?.teamThemes[0].logo;
  const teamName = data?.teamThemes[0].team.name;

  return (
    <Box
      sx={{
        background: "background",
        padding: 4,
        margin: 4,
        border: 1,
        borderColor: "border.main",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {teamLogo ? (
          <Box
            component="img"
            src={teamLogo}
            alt={teamName}
            sx={{
              maxWidth: 100,
              width: "100%",
              height: 50,
              objectFit: "contain",
              objectPosition: "left",
              display: "block",
            }}
          />
        ) : null}

        <Typography sx={{ fontWeight: "bold" }}>{teamName}</Typography>
      </Box>

      <Typography variant="h3" sx={{ mb: 2 }}>
        {props.latestEvent?.flowName}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={4}>
          <Typography sx={{ fontWeight: "bold" }}>Property address</Typography>
        </Grid>
        <Grid size={8}>
          <Typography>{props.latestEvent?.address}</Typography>
        </Grid>

        <Grid size={4}>
          <Typography sx={{ fontWeight: "bold" }}>Reference</Typography>
        </Grid>
        <Grid size={8}>
          <Typography>{props.sessionId}</Typography>
        </Grid>

        <Grid size={4}>
          <Typography sx={{ fontWeight: "bold" }}>Submitted on</Typography>
        </Grid>
        <Grid size={8}>
          <Typography>
            {new Date(props.latestEvent?.createdAt).toLocaleDateString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
