import { Meta, StoryObj } from "@storybook/react";

import Confirm from "./Confirm";

const meta = {
  title: "PlanX Components/Pay",
  component: Confirm,
  parameters: {
    reactNavi: {
      useCurrentRoute: () => ({
        data: {
          mountpath: "test mountpath",
        },
      }),
      useNavigation: () => ({
        navigate: () => console.log("called navigate()"),
      }),
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
    yourDetailsTitle: "Your details",
    yourDetailsLabel: "Your name or organisation name",
  },
} satisfies Story;

export const ForInformationOnly = {
  args: {
    title: "What you can expect to pay for your application",
    bannerTitle: "The calculated fee is",
    description:
      "Based on your answers so far, this is the fee that we've calculated. The fee will cover the cost of processing your application.",
    instructionsTitle: "How to pay",
    instructionsDescription:
      "Payments will be accepted for your future application via GOV.UK Pay. You will have the option to pay yourself or invite someone else to pay.",
    fee: 103,
    hidePay: true,
    onConfirm: () => {},
  },
} satisfies Story;
