import Typography from "@mui/material/Typography";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

export const Contract = () => (
  <SettingsSection background>
    <Typography variant="h3" component="h4" gutterBottom>
      Contract
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Terms and key dates of your software contract. OSL invoices annually for
      the fixed subscription cost of Plan✕.
    </Typography>
    <Typography variant="body1">[Coming soon]</Typography>
  </SettingsSection>
);
