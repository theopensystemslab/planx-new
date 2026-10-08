import type { Meta, StoryObj } from "@storybook/tanstack-react";

import InviteToPay from "./InviteToPay";

const meta = {
  title: "Design System/Pages/InviteToPay/ApplicantConfirmation",
  component: InviteToPay,
  parameters: {
    docs: {
      description: {
        component: `
The applicant's confirmation page after they invite someone else (a nominee) to pay.

**Route:** \`/$team/$flow/pay/invite?paymentRequestId=…\` (or \`/$flow/pay/invite\` on custom domains). The applicant is sent here after submitting the "Invite someone else to pay" form on the Pay component, and can revisit it at any point.

**Not shown on this page:** an unknown payment request, or an unpaid one past its 28-day expiry, redirects to \`pay/invite/failed\`. A paid request is shown as paid even after the expiry period, until the row is sanitised.
`,
      },
    },
  },
} satisfies Meta<typeof InviteToPay>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unpaid = {
  parameters: {
    docs: {
      description: {
        story:
          "The nominee has not paid yet. Shows the date the payment request expires.",
      },
    },
  },
  args: {
    id: "9e13f784-7299-4414-92ff-803bcacdfba8",
    paymentAmount: 123,
    sessionPreviewData: {},
    paidAt: null,
    createdAt: "2025-12-11",
    govPayPaymentId: null,
    stripePaymentId: null,
  },
} satisfies Story;

export const Paid = {
  parameters: {
    docs: {
      description: {
        story:
          "The nominee has paid (`paidAt` is set), so the application has been sent.",
      },
    },
  },
  args: {
    ...Unpaid.args,
    paidAt: "2025-12-12",
    govPayPaymentId: "abc-123",
    govPayMetadata: [],
    stripeMetadata: [],
  },
} satisfies Story;
