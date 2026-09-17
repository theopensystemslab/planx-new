import { hasFeatureFlag } from "lib/featureFlags";

import type { PaymentProviderName } from "../providers/types";

export const usePaymentProvider = (): PaymentProviderName => {
  // TODO: Check team_settings.payment_provider from DB
  if (hasFeatureFlag("STRIPE_MIGRATION")) {
    return "stripe";
  }

  return "govpay";
};
