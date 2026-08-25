import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Badge } from "../../../../../components/Badge/Badge";
import { BadgeVariant } from "../../../../../components/Badge/types";
import { useTeamLogo } from "../hooks";
import type { Submission } from "../types";
import { DownloadSubmissionButtonGrouped } from "./DownloadSubmissionButtonGrouped";
import { ViewSubmissionButtonGrouped } from "./ViewSubmissionButtonGrouped";

type SubmissionDetailsProps = {
  sessionId: string;
  latestEvent: Submission;
  teamSlug: string;
  submittedAt?: string;
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

  if (!data?.teams[0]) {
    return null;
  }

  const teamLogo = data?.teams[0].theme.logo;
  const teamName = data?.teams[0].name;
  const teamColour = data?.teams[0].theme.primaryColour;

  return (
    <Box
      sx={{
        background: "background",
        border: 1,
        margin: 1,
        borderColor: "border.main",
      }}
    >
      <Box sx={{ padding: 1, margin: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
          <Badge
            variant={BadgeVariant.Team}
            team={{
              name: teamName,
              theme: { primaryColour: teamColour, logo: teamLogo },
            }}
            size="compact"
          />

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
      </Box>

      {props.submittedAt ? (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            backgroundColor: "background.paper",
            padding: 1,
            gap: 2,
            borderTop: 1,
            borderColor: "border.main",
          }}
        >
          <ViewSubmissionButtonGrouped
            sessionId={props.sessionId}
            submittedAt={props.submittedAt}
          />
          <DownloadSubmissionButtonGrouped
            sessionId={props.sessionId}
            submittedAt={props.submittedAt}
          />
        </Box>
      ) : (
        <></>
      )}
    </Box>
  );
};
