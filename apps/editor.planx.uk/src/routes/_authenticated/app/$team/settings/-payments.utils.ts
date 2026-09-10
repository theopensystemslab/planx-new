import type {
  STRIPE_CONNECT_ERRORS,
  StripeConnectResult,
} from "lib/api/stripe/types";

import type { PaymentsSearch } from "./payments";

const DEFAULT_STRIPE_CONNECT_ERROR_MESSAGE =
  "Failed to connect Stripe account, please try again";

const STRIPE_CONNECT_ERROR_MESSAGES: Record<
  (typeof STRIPE_CONNECT_ERRORS)[number],
  string
> = {
  invalid_state: DEFAULT_STRIPE_CONNECT_ERROR_MESSAGE,
  access_denied: "Stripe connection was cancelled",
  missing_code: DEFAULT_STRIPE_CONNECT_ERROR_MESSAGE,
  connect_failed: DEFAULT_STRIPE_CONNECT_ERROR_MESSAGE,
};

export const getStripeConnectResult = ({
  stripeConnected,
  stripeError,
}: Pick<PaymentsSearch, "stripeConnected" | "stripeError">):
  StripeConnectResult | undefined => {
  if (stripeConnected) return { type: "success" };

  if (stripeError) {
    const message =
      STRIPE_CONNECT_ERROR_MESSAGES[
        stripeError as (typeof STRIPE_CONNECT_ERRORS)[number]
      ] ?? DEFAULT_STRIPE_CONNECT_ERROR_MESSAGE;
    return { type: "error", message };
  }

  return undefined;
};
