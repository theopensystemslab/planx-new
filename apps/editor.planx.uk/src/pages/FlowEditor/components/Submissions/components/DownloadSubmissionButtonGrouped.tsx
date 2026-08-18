import CloudDownload from "@mui/icons-material/CloudDownload";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import React from "react";

type Props = {
  sessionId: string;
  createdAt: string;
};
export const DownloadSubmissionButton = (props: Props) => {
  const submissionDataExpirationDate = addDays(
    new Date(props.createdAt),
    DAYS_UNTIL_EXPIRY,
  );

  if (!isBefore(new Date(), submissionDataExpirationDate)) return;

  const zipUrl = `${import.meta.env.VITE_APP_API_URL}/submission/${props.sessionId}/zip`;

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
