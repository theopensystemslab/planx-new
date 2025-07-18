import Typography from "@mui/material/Typography";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

export const SSLRenewal = () => (
  <SettingsSection background>
    <Typography variant="h3" component="h4" gutterBottom>
      SSL renewal
    </Typography>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      The expiration date of your SSL certificate. An active SSL certificate is
      required to host your services on a custom subdomain.
    </Typography>
    <Typography variant="body1">
      [Coming soon - move to `Settings` for max visibility??]
    </Typography>
  </SettingsSection>
);
