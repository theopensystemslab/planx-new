import { Meta, StoryObj } from "@storybook/react";
import React from "react";

import ResumePage, {
  EmailError,
  EmailRequired,
  EmailSuccess,
  InvalidSession,
  LockedSession,
  ValidationSuccess,
} from "./ResumePage";

const meta = {
  title: "Design System/Pages/Resume",
  component: ResumePage,
} satisfies Meta<typeof ResumePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  render: () => <EmailRequired setEmail={() => console.log("")} />,
} satisfies Story;

export const OnEmailSuccess = {
  render: () => <EmailSuccess />,
} satisfies Story;

export const OnEmailError = {
  render: () => <EmailError retry={() => console.log("")} />,
} satisfies Story;

export const OnReconciliationSuccess = {
  render: () => (
    <ValidationSuccess
      reconciliationResponse={reconciliationMock}
      continueApplication={() => console.log("")}
    />
  ),
} satisfies Story;

export const OnInvalidSession = {
  render: () => <InvalidSession retry={() => console.log("")} />,
} satisfies Story;

export const OnLockedSession = {
  render: () => <LockedSession paymentRequest={paymentRequestMock} />,
} satisfies Story;

const reconciliationMock = {
  message: "No content changes since last save point",
  changesFound: false,
  reconciledSessionData: {
    id: "123",
    sessionId: "abc",
    breadcrumbs: {}, // TODO mock real data for SummaryList
  },
};

const paymentRequestMock = {
  id: "123",
  payeeEmail: "Mx First Last",
  payeeName: "applicant@yahoo.com",
};
