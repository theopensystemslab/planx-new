import Stack from "@mui/material/Stack";
import { getRouteApi } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";

import Address from "./Address";
import Details from "./Details";
import Onboarding from "./Onboarding";
import { useStripeConnectResult } from "./Onboarding/hooks/useStripeConnectResult";
import { useStripeConnectStatus } from "./Onboarding/hooks/useStripeConnectStatus";
import Provider from "./Provider";
import StripeAccountTabs from "./StripeAccountTabs";

const routeApi = getRouteApi("/_authenticated/app/$team/settings/payments");

const PaymentSettings = () => {
  const stripeResult = routeApi.useLoaderData();
  const teamSlug = useStore((state) => state.teamSlug);

  useStripeConnectResult(stripeResult);

  const { data } = useStripeConnectStatus(teamSlug);
  const accounts = data?.accounts;

  if (accounts) {
    return (
      <Stack spacing={2}>
        <Provider />
        <StripeAccountTabs accounts={accounts} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Onboarding />
      <Provider />
      <Details />
      <Address />
    </Stack>
  );
};

export default PaymentSettings;
