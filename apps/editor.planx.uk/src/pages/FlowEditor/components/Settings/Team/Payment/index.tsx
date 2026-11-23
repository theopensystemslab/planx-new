import Stack from "@mui/material/Stack";
import { getRouteApi } from "@tanstack/react-router";

import Address from "./Address";
import Details from "./Details";
import Onboarding from "./Onboarding";
import { useStripeConnectResult } from "./Onboarding/hooks/useStripeConnectResult";
import Provider from "./Provider";

const routeApi = getRouteApi("/_authenticated/app/$team/settings/payments");

const PaymentSettings = () => {
  const stripeResult = routeApi.useLoaderData();

  useStripeConnectResult(stripeResult);

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
