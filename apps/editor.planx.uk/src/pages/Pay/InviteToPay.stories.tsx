import { Meta, StoryObj } from "@storybook/react";

import InviteToPay from "./InviteToPay";

const meta = {
  title: "Design System/Pages/InviteToPay/ApplicantConfirmation",
  component: InviteToPay,
} satisfies Meta<typeof InviteToPay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    id: "9e13f784-7299-4414-92ff-803bcacdfba8",
    applicantName: "Mr Bilbo Baggins",
    sessionId: "ab46c3ef-1104-4e21-b459-84bd0ac6b8fd",
    payeeName: "Gandalf",
    payeeEmail: "gandalf@maia.me",
    paymentAmount: 123,
    sessionPreviewData: {},
    paidAt: "11-12-25",
    createdAt: "11-12-25",
    govPayPaymentId: "abc-123",
  },
} satisfies Story;
