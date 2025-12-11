import Typography from "@mui/material/Typography";
import StatusPage from "pages/Preview/StatusPage";
import React from "react";

export const OfflinePage: React.FC = () => (
  <StatusPage bannerHeading="Service offline">
    <Typography variant="body1">
      <p>
        This service is not currently available to new users. Please check back
        later.
      </p>
      <p>
        If you're resuming a form you previously started, please use the link
        sent to you via email.
      </p>
    </Typography>
  </StatusPage>
);
