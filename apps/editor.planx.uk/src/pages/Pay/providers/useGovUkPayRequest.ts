import type { GovUKPayment } from "@opensystemslab/planx-core/types";
import { PaymentStatus } from "@opensystemslab/planx-core/types";
import { getITPPayment, initiateITPPayment } from "lib/api/pay/requests";
import { useEffect, useState } from "react";

import { logger } from "../../../airbrake";
import type { PaymentRequestState } from "./types";

const States = {
  Init: {
    loading: "Loading...",
  },
  Fetching: {
    loading: "Loading payment information",
  },
  Finished: {
    loading: "Payment Successful",
  },
  Ready: {
    button: "Pay now",
    loading: "Connecting to the payment page",
  },
  ReadyToRetry: {
    button: "Retry payment",
    loading: "Reconnecting to the payment page",
  },
  Reset: {
    button: "Retry payment",
    loading: "Connecting to the payment page",
  },
} as const;

enum PaymentState {
  Completed,
  Pending,
  Failed,
  NotStarted,
}

export function useGovUkPayRequest({
  paymentRequestId,
  govPayPaymentId,
}: {
  paymentRequestId: string;
  govPayPaymentId: string | null;
}): PaymentRequestState {
  const [currentState, setState] = useState<
    (typeof States)[keyof typeof States]
  >(States.Init);
  const [isLoading, setIsLoading] = useState(true);
  const [payment, setPayment] = useState<GovUKPayment | undefined>(undefined);

  // Pass async errors up to ErrorBoundary
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  useEffect(() => {
    if (errorMessage) throw Error(errorMessage);
  }, [errorMessage]);

  useEffect(() => {
    // synchronize payment state on load
    updatePaymentState();
  }, []);

  const updatePaymentState = async () => {
    setState(States.Fetching);
    let responseData: GovUKPayment | null = null;

    try {
      if (govPayPaymentId) {
        responseData = await getITPPayment({
          paymentRequestId,
          govPayPaymentId,
        });
      }
    } catch {
      setErrorMessage("Failed to fetch payment details");
    }

    if (responseData) resolvePaymentResponse(responseData);
    setIsLoading(false);
    switch (computePaymentState(responseData)) {
      case PaymentState.NotStarted:
        setState(States.Ready);
        break;
      case PaymentState.Pending:
        setState(States.ReadyToRetry);
        break;
      case PaymentState.Failed:
        setState(States.Reset);
        setPayment(undefined);
        break;
      case PaymentState.Completed:
        setState(States.Finished);
        break;
    }
  };

  const resolvePaymentResponse = (responseData: GovUKPayment): GovUKPayment => {
    if (!responseData?.state?.status)
      throw new Error("Corrupted response from GOV.UK");
    setPayment(responseData);
    // useState is async, so we also pass the resolved value to the chained promise
    return responseData;
  };

  const readyAction = async () => {
    setIsLoading(true);
    if (payment && currentState === States.ReadyToRetry) {
      redirectToGovPay(payment);
    } else {
      await initiateITPPayment({
        paymentRequestId,
        returnURL: window.location.href,
      })
        .then(resolvePaymentResponse)
        .then(redirectToGovPay)
        .catch(logger.notify);
    }
  };

  if (isLoading) return { status: "loading", text: currentState.loading };

  switch (currentState) {
    case States.Finished:
      return { status: "paid" };
    case States.Ready:
    case States.Reset:
    case States.ReadyToRetry:
      return {
        status: "ready",
        buttonTitle: currentState.button!,
        onPay: readyAction,
      };
    default:
      return { status: "loading", text: currentState.loading };
  }
}

// return to GovPay with an existing payment
function redirectToGovPay(payment?: GovUKPayment) {
  if (payment && payment._links.next_url?.href) {
    window.location.replace(payment._links.next_url.href);
  } else {
    logger.notify(
      "GovPay redirect failed. The payment didn't exist or did not include a 'next_url' link.",
    );
  }
}

function computePaymentState(govUkPayment: GovUKPayment | null): PaymentState {
  if (!govUkPayment) {
    return PaymentState.NotStarted;
  }
  if (govUkPayment.state.status === PaymentStatus.success) {
    return PaymentState.Completed;
  }
  const paymentHasNextLinks = !!govUkPayment._links?.next_url?.href;
  if (
    [
      PaymentStatus.started,
      PaymentStatus.created,
      PaymentStatus.submitted,
    ].includes(govUkPayment.state.status) &&
    paymentHasNextLinks
  ) {
    return PaymentState.Pending;
  }
  return PaymentState.Failed;
}
