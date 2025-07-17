import Typography from "@mui/material/Typography";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

export const Discount = () => (
  <SettingsSection background>
    <Typography variant="h3" component="h4" gutterBottom>
      Discount
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Service charges exceeding £10k per year count as a discount towards your
      next renewal cost of Plan✕.
    </Typography>
    <Typography variant="body1">[Coming soon]</Typography>
  </SettingsSection>
);
