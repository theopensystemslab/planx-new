import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

export const Subscription = () => {
  return (
    <Container maxWidth="contentWrap">
      <SettingsSection data-testid="subscription">
        <Typography variant="h2" component="h3" gutterBottom>
          Subscription
        </Typography>
        <Typography variant="body1">Coming soon</Typography>
      </SettingsSection>
    </Container>
  );
};
