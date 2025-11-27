import CloudDownload from "@mui/icons-material/CloudDownload";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { RenderCellParams } from "ui/shared/DataTable/types";

export const DownloadSubmissionButton = (params: RenderCellParams) => {
  const [teamSlug, canUserEditTeam, submissionEmail] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
    state.teamSettings?.submissionEmail,
  ]);

  const submissionDataExpirationDate = addDays(
    new Date(params.row.createdAt),
    DAYS_UNTIL_EXPIRY,
  );

  const showDownloadButton =
    teamSlug &&
    canUserEditTeam(teamSlug) &&
    submissionEmail &&
    params.row.status === "Success" &&
    params.row.eventType !== "Pay" &&
    isBefore(new Date(), submissionDataExpirationDate);

  if (!showDownloadButton) return;

  const zipUrl = `${import.meta.env.VITE_APP_API_URL}/download-application-files/${
    params.row.sessionId
  }?localAuthority=${teamSlug}&email=${submissionEmail}`;

  return (
    <Tooltip title="Download application data">
      <IconButton
        aria-label="download application"
        onClick={() => window.open(zipUrl, "_blank")}
      >
        <CloudDownload />
      </IconButton>
    </Tooltip>
  );
};
