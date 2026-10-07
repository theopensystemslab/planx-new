import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useStore } from "pages/FlowEditor/lib/store";

import MakePayment from "./MakePayment";

const meta = {
  title: "Design System/Pages/InviteToPay/NomineePayment",
  component: MakePayment,
  parameters: {
    docs: {
      description: {
        component: `
The nominee's payment page, reached from the link in their invitation email. This is separate from the Pay component used by the applicant within a flow.

**Route:** \`/$team/$flow/pay?paymentRequestId=…\` (or \`/$flow/pay\` on custom domains).

**Not shown on this page:** an unknown payment request, or an unpaid one past its 28-day expiry, redirects to \`pay/not-found\`. A paid request is shown as paid even after the expiry period, until the row is sanitised.

**Retry state:** if a GovPay payment has already been started (\`govPayPaymentId\` is set), the page fetches its status on load and may show "Retry payment".
`,
      },
    },
  },
  decorators: [
    (Story) => {
      useStore.setState({
        flowName: "Apply for a lawful development certificate",
      });

      return <Story />;
    },
  ],
} satisfies Meta<typeof MakePayment>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unpaid = {
  parameters: {
    docs: {
      description: {
        story:
          'No payment has been started. Shows the fee, when the payment request expires, and the "Pay now" button.',
      },
    },
  },
  args: {
    id: "9e13f784-7299-4414-92ff-803bcacdfba8",
    paymentAmount: 12300,
    sessionPreviewData: {
      _address: { title: "45, Greenfield Road, London SE22 7FF" },
      "proposal.projectType": ["extend.rear"],
    },
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
          "The payment request has been paid (`paidAt` is set), e.g. when the nominee refreshes or revisits the link. Shows the payment date and reference.",
      },
    },
  },
  args: {
    ...Unpaid.args,
    paidAt: "2025-12-12",
    govPayPaymentId: "qe817o3kds9474rfkfldfHSK874JB",
  },
} satisfies Story;
