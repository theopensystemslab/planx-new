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
    title: "Pay",
    bannerTitle: "The fee is",
    description: "The fee covers the cost of processing your form",
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
    title: "Pay",
    bannerTitle: "The fee is",
    description: "The fee covers the cost of processing your form",
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
    title: "What you can expect to pay",
    bannerTitle: "The calculated fee is",
    description:
      "Based on your answers so far, this is the fee that we've calculated. The fee will cover the cost of processing your form.",
    instructionsTitle: "How to pay",
    instructionsDescription:
      "Payments will be accepted via GOV.UK Pay. You will have the option to pay yourself or invite someone else to pay.",
    fee: 103,
    hidePay: true,
    onConfirm: () => {},
  },
} satisfies Story;

// // TODO: Setup fee breakdown amounts
// export const WithFeeBreakdown = {
//   args: {
//     title: "Pay",
//     bannerTitle: "The fee is",
//     description: "The fee covers the cost of processing your form",
//     fee: 103,
//     instructionsTitle: "How to pay",
//     instructionsDescription: "Pay via GOV.UK Pay",
//     buttonTitle: "Pay",
//     onConfirm: () => {},
//     error: undefined,
//     showInviteToPay: false,
//   },
// } satisfies Story;

export const WithError = {
  args: {
    error: "GOV.UK Pay is not enabled for this local authority",
    fee: 103,
    onConfirm: () => {},
  },
} satisfies Story;
