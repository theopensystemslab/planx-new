import type { Props } from "../Pay";
import type { UsePaymentProviderResult } from "../providers/types";
import { useGovUkPay } from "../providers/useGovUkPay";
import { useNoPaymentProvider } from "../providers/useNoPaymentProvider";
import { useStripePay } from "../providers/useStripePay";
import type { Action } from "../types";
import { usePaymentProvider } from "./usePaymentProvider";

export const usePaymentFlow = (
  props: Props,
  dispatch: React.Dispatch<Action>,
  fee: number,
): UsePaymentProviderResult => {
  const providerName = usePaymentProvider();

  const govPay = useGovUkPay(props, dispatch, fee);
  const stripe = useStripePay(props, dispatch, fee);
  // A team without a payment provider can still use Pay with props.hidePay
  const noProvider = useNoPaymentProvider(props, dispatch);

  switch (providerName) {
    case "stripe":
      return stripe;
    case "govpay":
      return govPay;
    default:
      return noProvider;
  }
};
