import CloudDownload from "@mui/icons-material/CloudDownload";
import Button from "@mui/material/Button";
import React from "react";

type Props = {
  sessionId: string;
  submittedAt: string;
};

export const DownloadSubmissionButtonGrouped = (props: Props) => {
  const zipUrl = `${import.meta.env.VITE_APP_API_URL}/submission/${props.sessionId}/zip`;

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={() => window.open(zipUrl, "_blank")}
      disabled={!props.submittedAt}
      startIcon={<CloudDownload />}
    >
      Download
    </Button>
  );
};
