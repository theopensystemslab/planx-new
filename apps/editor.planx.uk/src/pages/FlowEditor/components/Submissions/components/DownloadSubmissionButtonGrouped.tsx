import CloudDownload from "@mui/icons-material/CloudDownload";
import Button from "@mui/material/Button";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import React from "react";

type Props = {
  sessionId: string;
  submittedAt?: string;
};

export const DownloadSubmissionButtonGrouped = (props: Props) => {
  const submissionDataExpirationDate = props.submittedAt
    ? addDays(new Date(props.submittedAt), DAYS_UNTIL_EXPIRY)
    : null;

  const showDownloadButton = submissionDataExpirationDate
    ? isBefore(new Date(), submissionDataExpirationDate)
    : false;

  if (!showDownloadButton) return;

  const zipUrl = `${import.meta.env.VITE_APP_API_URL}/submission/${props.sessionId}/zip`;

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={() => window.open(zipUrl, "_blank")}
      disabled={!props.submittedAt}
    >
      <CloudDownload sx={{ mr: 1 }} />
      Download
    </Button>
  );
};
