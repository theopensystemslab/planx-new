import type { Meta, StoryObj } from "@storybook/tanstack-react";

import PaymentProcessing from "./PaymentProcessing";

/**
 * Returned from Stripe Checkout having paid by a delayed payment method (e.g. Bacs Direct Debit)
 */
const meta = {
  title: "PlanX Components/Pay/Payment processing",
  component: PaymentProcessing,
} satisfies Meta<typeof PaymentProcessing>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Basic = {} satisfies Story;
