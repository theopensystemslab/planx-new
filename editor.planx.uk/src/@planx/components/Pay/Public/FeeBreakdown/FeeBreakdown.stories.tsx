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
          "A basic fee breakdown table - just a fee, no reductions or exemptions",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: [],
      exemptions: [],
      amount: {
        calculated: 1000,
        payable: 1000,
        reduction: 0,
        exemption: 0,
        vat: 0,
      },
    },
  },
};

export const WithVAT: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A fee breakdown which includes a VAT-able service charge and Fast Track fee",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: [],
      exemptions: [],
      amount: {
        calculated: 1000,
        payable: 1156,
        serviceCharge: 30, // 20% VAT = 6
        fastTrack: 100, // 20% VAT = 20
        reduction: 0,
        exemption: 0,
        vat: 26, // Summed VAT
      },
    },
  },
};

export const WithReductions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A fee breakdown with a list of reductions. The reductions amount is summarised and not calculated per-item.",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: ["alternative", "parishCouncil"],
      exemptions: [],
      amount: {
        calculated: 1000,
        payable: 800,
        reduction: 200,
        exemption: 0,
        vat: 0,
      },
    },
  },
};

export const WithExemptions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A fee breakdown with an exemption - this sets the payable fee to the VAT-able service charge only",
      },
    },
  },
  args: {
    inviteToPayFeeBreakdown: {
      reductions: [],
      exemptions: ["disability"],
      amount: {
        calculated: 1000,
        payable: 36,
        serviceCharge: 30,
        reduction: 0,
        exemption: 1000,
        vat: 6,
      },
    },
  },
};
