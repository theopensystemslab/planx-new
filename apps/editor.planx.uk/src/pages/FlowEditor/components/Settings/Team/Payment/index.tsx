import Stack from "@mui/material/Stack";

import { Onboarding } from "./Onboarding";
import { Provider } from "./Provider";
import { Status } from "./Status";

const PaymentSettings = () => (
  <Stack spacing={2}>
    <Onboarding />
    <Status />
    <Provider />
  </Stack>
);

export default PaymentSettings;
