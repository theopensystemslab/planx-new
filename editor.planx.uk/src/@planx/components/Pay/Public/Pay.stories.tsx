import { Meta, StoryObj } from "@storybook/react";

import Confirm from "./Confirm";

const meta = {
  title: "PlanX Components/Pay",
  component: Confirm,
  parameters: {
    reactNavi: {
      useCurrentRoute: () => {},
      useNavigation: () => {},
    },
  },
} satisfies Meta<typeof Confirm>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {
  args: {
    title: "Pay for your application",
    bannerTitle: "The fee is",
    description: "The fee covers the cost of processing your application",
    fee: 103,
    instructionsTitle: "How to pay",
    instructionsDescription: "Pay via GOV.UK Pay",
    buttonTitle: "Pay",
    onConfirm: () => {},
    error: undefined,
    showInviteToPay: false,
  },
} satisfies Story;

export const WithInviteToPay = {
  args: {
    title: "Pay for your application",
    bannerTitle: "The fee is",
    description: "The fee covers the cost of processing your application",
    fee: 103,
    instructionsTitle: "How to pay",
    instructionsDescription: "Pay via GOV.UK Pay",
    buttonTitle: "Pay",
    onConfirm: () => {},
    error: undefined,
    showInviteToPay: true,
    nomineeTitle: "Details of your nominee",
    nomineeDescription: "Invite someone else to pay via GOV.UK Pay",
  },
} satisfies Story;
