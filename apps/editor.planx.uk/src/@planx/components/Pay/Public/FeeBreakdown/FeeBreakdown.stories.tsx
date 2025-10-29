import { Meta, StoryObj } from "@storybook/react";

import { FeeBreakdown } from "./FeeBreakdown";

const meta = {
  title: "PlanX Components/Pay/FeeBreakdown",
  component: FeeBreakdown,
} satisfies Meta<typeof FeeBreakdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A basic fee breakdown table for a statutory application fee without any extra charges, exemptions or reductions",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: [],
      exemptions: [],
      amount: {
        calculated: 528,
        calculatedVAT: 0,
        payable: 528,
        payableVAT: 0,
        fastTrack: 0,
        fastTrackVAT: 0,
        serviceCharge: 0,
        serviceChargeVAT: 0,
        paymentProcessing: 0,
        paymentProcessingVAT: 0,
        reduction: 0,
        reductionVAT: 0,
        exemption: 0,
        exemptionVAT: 0,
      },
    },
  },
};

export const WithVAT: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A fee breakdown which includes a VAT-able discretionary application fee, service charge, Fast Track fee, and payment processing fee",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: [],
      exemptions: [],
      amount: {
        calculated: 1000,
        calculatedVAT: 200,
        payable: 1354.06,
        payableVAT: 225.68,
        serviceCharge: 40,
        serviceChargeVAT: 8,
        fastTrack: 75,
        fastTrackVAT: 15,
        paymentProcessing: 13.38,
        paymentProcessingVAT: 2.68,
        reduction: 0,
        reductionVAT: 0,
        exemption: 0,
        exemptionVAT: 0,
      },
    },
  },
};

export const WithExemptions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A fee breakdown with an exemption that zeros out the statutory application fee",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: [],
      exemptions: ["resubmission"],
      amount: {
        calculated: 1000,
        calculatedVAT: 0,
        payable: 0,
        payableVAT: 0,
        fastTrack: 0,
        fastTrackVAT: 0,
        serviceCharge: 0,
        serviceChargeVAT: 0,
        paymentProcessing: 0,
        paymentProcessingVAT: 0,
        reduction: 0,
        reductionVAT: 0,
        exemption: -1000,
        exemptionVAT: 0,
      },
    },
  },
};

export const WithReductions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A fee breakdown for a statutory application type with reductions and a service charge. The total reductions amount is summarised, not itemised",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: ["alternative", "parishCouncil"],
      exemptions: [],
      amount: {
        calculated: 1000,
        calculatedVAT: 0,
        payable: 848,
        payableVAT: 8,
        fastTrack: 0,
        fastTrackVAT: 0,
        serviceCharge: 40,
        serviceChargeVAT: 8,
        paymentProcessing: 0,
        paymentProcessingVAT: 0,
        reduction: -200,
        reductionVAT: 0,
        exemption: 0,
        exemptionVAT: 0,
      },
    },
  },
};

export const WithModifications: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A fee breakdown for a statutory householder fee with a sports club fee (flat fee of £578). In this case, the sports club fee is greater than the householder application fee so we label it a modification rather than reduction",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: ["sports"],
      exemptions: [],
      amount: {
        calculated: 258,
        calculatedVAT: 0,
        payable: 578,
        payableVAT: 0,
        fastTrack: 0,
        fastTrackVAT: 0,
        serviceCharge: 0,
        serviceChargeVAT: 0,
        paymentProcessing: 0,
        paymentProcessingVAT: 0,
        reduction: 320,
        reductionVAT: 0,
        exemption: 0,
        exemptionVAT: 0,
      },
    },
  },
};
