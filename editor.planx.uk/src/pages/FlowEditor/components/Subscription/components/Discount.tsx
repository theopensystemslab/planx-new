import Typography from "@mui/material/Typography";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

import { SubscriptionProps } from "../types";

export const Discount = ({ serviceCharges }: SubscriptionProps) => {
  return (
    <SettingsSection background>
      <Typography variant="h3" component="h4" gutterBottom>
        Discount
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Service charges exceeding £10k per fiscal year count as a discount
        towards your next renewal cost of Plan✕.
      </Typography>
      {serviceCharges.length > 0 ? (
        <Typography variant="body1">[Coming soon]</Typography>
      ) : (
        <Typography variant="body1">No service charges found.</Typography>
      )}
    </SettingsSection>
  );
};
