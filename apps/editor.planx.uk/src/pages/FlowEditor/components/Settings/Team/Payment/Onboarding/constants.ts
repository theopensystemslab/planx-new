import type { StripeAccountStatus } from "lib/api/stripe/types";

export const ACCOUNT_STATUS_DISPLAY: Record<
  StripeAccountStatus,
  {
    label: string;
    color: "success" | "warning" | "info" | "error";
    description?: string;
  }
> = {
  active: { label: "Connected", color: "success" },
  incomplete: {
    label: "Setup incomplete",
    color: "warning",
    description:
      "Your Stripe account has been created, but Stripe needs more information before it can take payments. Finish setting up your account in the Stripe dashboard.",
  },
  pending: {
    label: "Pending verification",
    color: "info",
    description:
      "Stripe is checking the details you provided. Payments can't be taken until this is complete.",
  },
  unavailable: {
    label: "Disconnected",
    color: "error",
    description:
      "PlanX can no longer access this Stripe account. It may have been deleted, or its connection to PlanX removed. Connect a Stripe account to take payments again.",
  },
};
