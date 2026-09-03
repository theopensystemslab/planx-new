import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import type { Submission } from "../types";
import { PaymentMenu } from "./PaymentMenu";

const mockSucceededPayment: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "126ec0c4-12f2-1209-aa09-11294ec3ee12",
  eventId: "c8uu7c6a-7ea9-412d-9c4d-8f08039e1212",
  eventType: "Pay",
  status: "Success",
  retry: false,
  response: {},
  createdAt: "2024-01-12T12:17:42.275655+00:00",
  flowName: "Apply for a lawful development certificate",
  address: "1, AMERSHAM ROAD, BEACONSFIELD, BUCKINGHAMSHIRE, HP9 2HA",
};

const meta = {
  // TODO: Match Ollie's paths
  title: "Editor Components/Submissions/Details Modal/Payment menu",
  component: PaymentMenu,
  decorators: [
    (Story) => (
      <Box sx={{ p: 2 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PaymentMenu>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    sessionId: mockSucceededPayment.sessionId,
    paymentEvent: mockSucceededPayment,
  },
} satisfies Story;
