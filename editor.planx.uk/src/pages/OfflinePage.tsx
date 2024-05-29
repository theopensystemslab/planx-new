import Typography from "@mui/material/Typography";
import StatusPage from "pages/Preview/StatusPage";
import React from "react";

export const OfflinePage: React.FC = () => (
  <StatusPage bannerHeading="Offline">
    <Typography variant="body2">
      This service is not currently available. Please check back later.
    </Typography>
  </StatusPage>
);
