import Stack from "@mui/material/Stack";
import { getRouteApi } from "@tanstack/react-router";

import Onboarding from "./Onboarding";
import Provider from "./Provider";

const routeApi = getRouteApi("/_authenticated/app/$team/settings/payments");

const PaymentSettings = () => {
  const stripeResult = routeApi.useLoaderData();

  return (
    <Stack spacing={2}>
      <Onboarding stripeResult={stripeResult} />
      <Provider />
    </Stack>
  );
};

export default PaymentSettings;
