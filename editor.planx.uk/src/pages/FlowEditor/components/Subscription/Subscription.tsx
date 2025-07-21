import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";

import { Contract } from "./components/Contract";
import { Discount } from "./components/Discount";
import { ServiceCharges } from "./components/ServiceCharges";
import { SubscriptionProps } from "./types";

export const Subscription = ({ serviceCharges }: SubscriptionProps) => (
  <Container maxWidth="formWrap">
    <SettingsSection>
      <Typography variant="h2" component="h3" gutterBottom>
        Subscription
      </Typography>
      <Typography variant="body1">
        Details about your Plan✕ software subscription.
      </Typography>
    </SettingsSection>
    <ServiceCharges serviceCharges={serviceCharges} />
    <Contract />
    <Discount serviceCharges={serviceCharges} />
    {/* <SSLRenewal /> */}
  </Container>
);
