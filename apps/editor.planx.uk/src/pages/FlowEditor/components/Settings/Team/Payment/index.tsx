import Stack from "@mui/material/Stack";

import { Onboarding } from "./Onboarding";
import { Provider } from "./Provider";

const PaymentSettings = () => (
  <Stack spacing={2}>
    <Onboarding />
    <Provider />
  </Stack>
);

export default PaymentSettings;
