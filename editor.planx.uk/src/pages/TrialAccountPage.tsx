import Typography from "@mui/material/Typography";
import StatusPage from "pages/Preview/StatusPage";
import React from "react";

export const TrialAccountPage: React.FC = () => (
  <StatusPage bannerHeading="Trial account">
    <Typography variant="body1">
      This account is currently in trial mode and does not have access to published services. Please contact Open Systems Lab for further information.
    </Typography>
  </StatusPage>
);
