import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import SettingsSection from "ui/editor/SettingsSection";

import { Contract } from "./components/Contract";
import { Discount } from "./components/Discount";
import { ServiceCharges } from "./components/ServiceCharges";
import type { SubscriptionProps } from "./types";

export const Subscription = ({ serviceCharges }: SubscriptionProps) => {
  const { contract } = useStore((state) => state.teamSettings);

  return (
    <Container maxWidth="formWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Subscription
        </Typography>
        <Typography variant="body1">
          Details about your Plan✕ software subscription.
        </Typography>
      </SettingsSection>
      <ServiceCharges serviceCharges={serviceCharges} contract={contract} />
      {contract !== "opt_out_sc" && (
        <Discount serviceCharges={serviceCharges} />
      )}
      <Contract />
    </Container>
  );
};
