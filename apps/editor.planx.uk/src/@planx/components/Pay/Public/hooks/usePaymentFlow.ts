import type { PaymentMetadata } from "@opensystemslab/planx-core/types";

import type { Props } from "../Pay";
import type { UsePaymentProviderResult } from "../providers/types";
import { useGovUkPay } from "../providers/useGovUkPay";
import { useStripePay } from "../providers/useStripePay";
import type { Action } from "../types";
import { usePaymentProvider } from "./usePaymentProvider";

export const usePaymentFlow = (
  props: Props,
  dispatch: React.Dispatch<Action>,
  fee: number,
  metadata: PaymentMetadata[],
): UsePaymentProviderResult => {
  const providerName = usePaymentProvider();
  const govPay = useGovUkPay(props, dispatch, fee, metadata);
  const stripe = useStripePay(props, dispatch, fee);

  return providerName === "stripe" ? stripe : govPay;
};
