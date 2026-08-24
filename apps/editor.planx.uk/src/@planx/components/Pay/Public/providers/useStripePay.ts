import { logger } from "airbrake";
import { useStore } from "pages/FlowEditor/lib/store";

import { makeData } from "../../../shared/utils";
import type { Props } from "../Pay";
import { Action } from "../types";
import {
  PAYMENT_REFERENCE_PASSPORT_KEY,
  type UsePaymentProviderResult,
} from "./types";

export function useStripePay(
  props: Props,
  dispatch: React.Dispatch<Action>,
  _fee: number,
): UsePaymentProviderResult {
  const environment = useStore((state) => state.previewEnvironment);

  const handleSuccess = () => {
    dispatch(Action.Success);
    props.handleSubmit &&
      props.handleSubmit(
        makeData(props, "todo-stripe-data", PAYMENT_REFERENCE_PASSPORT_KEY),
      );
  };

  const startNewPayment = async () => {
    dispatch(Action.StartNewPayment);

    if (environment !== "standalone" || props.hidePay) {
      handleSuccess();
      return;
    }

    console.log("Started new Stripe payment");
  };

  const refetchPayment = async () => {
    console.log("Refetching Stripe payment details");
  };

  const resumeExistingPayment = async () => {
    await startNewPayment();
  };

  return {
    actions: {
      startNewPayment,
      refetchPayment,
      resumeExistingPayment,
      handleSuccess,
    },
    passportKey: PAYMENT_REFERENCE_PASSPORT_KEY,
    hasExistingPayment: false,
  };
}
