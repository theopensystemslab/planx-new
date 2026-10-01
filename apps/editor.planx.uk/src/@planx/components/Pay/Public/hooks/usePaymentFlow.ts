import { hasFeatureFlag } from "lib/featureFlags";
import type { PaymentProvider } from "pages/FlowEditor/components/Settings/Team/Payment/Provider";

import type { Props } from "../Pay";
import type { UsePaymentProviderResult } from "../providers/types";
import { useGovUkPay } from "../providers/useGovUkPay";
import { useNoPaymentProvider } from "../providers/useNoPaymentProvider";
import { useStripePay } from "../providers/useStripePay";
import type { Action } from "../types";

export const usePaymentFlow = (
  props: Props,
  dispatch: React.Dispatch<Action>,
  fee: number,
  paymentProvider?: PaymentProvider,
): UsePaymentProviderResult => {
  const govPay = useGovUkPay(props, dispatch, fee);
  const stripe = useStripePay(props, dispatch, fee);
  // A team without a payment provider can still use Pay with props.hidePay
  const noProvider = useNoPaymentProvider(props, dispatch);

  switch (paymentProvider) {
    case "stripe":
      // Stripe payments are not yet feature complete - applicants can't pay until it's removed
      // TODO: Drop when Stripe payments have feature parity w/ GovPay
      return hasFeatureFlag("STRIPE_MIGRATION") ? stripe : noProvider;
    case "govpay":
      return govPay;
    default:
      return noProvider;
  }
};
