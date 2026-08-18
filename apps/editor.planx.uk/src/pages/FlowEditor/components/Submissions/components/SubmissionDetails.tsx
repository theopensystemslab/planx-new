import Box from "@mui/material/Box";
// import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";

import { useTeamLogo } from "../hooks";
// import { DownloadSubmissionButton } from "./DownloadSubmissionButton";
import type { Submission } from "../types";
// import { ViewSubmissionButton } from "./ViewSubmissionButton";

type SubmissionDetailsProps = {
  sessionId: string;
  latestEvent: Submission;
  teamSlug: string;
};

type DetailRowProps = {
  label: string;
  value: string | null;
  border?: boolean;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value, border }) => (
  <Box
    sx={{
      display: "flex",
      py: 2,
      borderBottom: border ? 1 : 0,
      borderColor: "border.main",
    }}
  >
    <Typography sx={{ fontWeight: "bold", width: "33%" }}>{label}</Typography>
    <Typography sx={{ width: "66%" }}>{value}</Typography>
  </Box>
);

export const SubmissionDetails: React.FC<SubmissionDetailsProps> = (props) => {
  const { data } = useTeamLogo(props.teamSlug);
  const teamLogo = data?.teams[0].theme.logo;
  const teamName = data?.teams[0].name;

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
      <Box>
        <DetailRow
          label="Property address"
          value={props.latestEvent?.address}
          border={true}
        />
        <DetailRow label="Reference" value={props.sessionId} border={true} />
        <DetailRow
          label="Submitted on"
          value={new Date(props.latestEvent?.createdAt).toLocaleDateString()}
        />
      </Box>

      {/* <DialogActions>
        <ViewSubmissionButton />
        <DownloadSubmissionButton />
      </DialogActions> */}
    </Box>
  );
};
