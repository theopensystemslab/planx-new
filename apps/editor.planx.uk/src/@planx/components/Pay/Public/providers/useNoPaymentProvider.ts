import { useStore } from "pages/FlowEditor/lib/store";

import type { Props } from "../Pay";
import type { NoPaymentAction } from "../types";
import { Action } from "../types";
import {
  PAYMENT_REFERENCE_PASSPORT_KEY,
  type UsePaymentProviderResult,
} from "./types";

/**
 * Used when a team has not configured a payment provider
 *
 * Pay can still be used in info-only mode (props.hidePay) or viewed in the
 * Editor preview panel without throwing an error
 */
export function useNoPaymentProvider(
  props: Props,
  dispatch: React.Dispatch<NoPaymentAction>,
): UsePaymentProviderResult {
  const environment = useStore((state) => state.previewEnvironment);

  const handleSuccess = () => {
    dispatch(Action.Success);
    props.handleSubmit && props.handleSubmit({});
  };

  const startNewPayment = async () => {
    dispatch(Action.StartNewPayment);

    // Skip the redirect when viewing in the Editor or using Pay in info-only mode
    if (environment !== "standalone" || props.hidePay) {
      handleSuccess();
      return;
    }

    // No provider to redirect to, show a custom error message
    dispatch(Action.StartNewPaymentError);
  };

  // No existing payment can be found without a provider
  const refetchPayment = async () => dispatch(Action.NoPaymentFound);

  return {
    actions: {
      startNewPayment,
      refetchPayment,
      resumeExistingPayment: startNewPayment,
      handleSuccess,
    },
    passportKey: PAYMENT_REFERENCE_PASSPORT_KEY,
    hasExistingPayment: false,
  };
}
