import Typography from "@mui/material/Typography";
import StatusPage from "pages/Preview/StatusPage";
import React from "react";

export const OfflinePage: React.FC = () => (
  <StatusPage bannerHeading="Offline">
    <Typography variant="body2">
      This service is not currently available to new applicants. Please check
      back later.
    </Typography>
    <Typography variant="body2">
      If you're resuming an application you previously started, please use the
      link sent to you via email.
    </Typography>
  </StatusPage>
);
