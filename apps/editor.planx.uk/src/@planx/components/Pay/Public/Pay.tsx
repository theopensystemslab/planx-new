import type { PublicProps } from "@planx/components/shared/types";
import { logger } from "airbrake";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect, useReducer } from "react";

import type { Pay } from "../model";
import { getDefaultContent } from "../model";
import Confirm from "./Confirm";
import { useGovUkPay } from "./providers/useGovUkPay";
import { Action } from "./types";

export default Component;
export type Props = PublicProps<Pay>;

type ComponentState =
  | { status: "indeterminate"; displayText?: string }
  | { status: "no_payment_found" }
  | { status: "init" }
  | { status: "redirecting"; displayText?: string }
  | { status: "fetching_payment"; displayText?: string }
  | { status: "retry" }
  | { status: "status_unknown" }
  | { status: "success"; displayText?: string }
  | { status: "unsupported_team" }
  | { status: "undefined_fee" }
  | { status: "zero_fee" };

export const PAY_API_ERROR_UNSUPPORTED_TEAM =
  "Online payments are not enabled for";

const reducer = (_state: ComponentState, action: Action): ComponentState => {
  switch (action) {
    case Action.NoFeeFound:
      return { status: "undefined_fee" };
    case Action.NoPaymentFound:
      return { status: "no_payment_found" };
    case Action.IncompletePaymentFound:
      return {
        status: "fetching_payment",
        displayText: "Loading payment information",
      };
    case Action.IncompletePaymentConfirmed:
      return { status: "retry" };
    case Action.PaymentStatusUnknown:
      return { status: "status_unknown" };
    case Action.StartNewPayment:
      return {
        status: "redirecting",
        displayText: "Connecting you to the payment page",
      };
    case Action.StartNewPaymentError:
      return { status: "unsupported_team" };
    case Action.ResumePayment:
      return {
        status: "redirecting",
        displayText: "Reconnecting to the payment page",
      };
    case Action.Success:
      return { status: "success", displayText: "Payment Successful" };
    case Action.ZeroFee:
      return { status: "zero_fee" };
  }
};

function Component(props: Props) {
  const [sessionId, govUkPayment, passport] = useStore((state) => [
    state.sessionId,
    state.govUkPayment,
    state.computePassport(),
  ]);
  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;

  const defaultMetadata = getDefaultContent().govPayMetadata;
  const metadata = [...(props.govPayMetadata || []), ...defaultMetadata];

  const [state, dispatch] = useReducer(reducer, {
    status: "indeterminate",
    displayText: "Loading...",
  });

  const { actions, hasExistingPayment } = useGovUkPay(
    props,
    dispatch,
    fee,
    metadata,
  );

  const isTeamSupported = state.status !== "unsupported_team";
  const showPayOptions = props.allowInviteToPay && !props.hidePay;

  useEffect(() => {
    // Skip component when fee is negative
    // Log error silently - this was likely a content error that should be addressed
    if (fee < 0) {
      dispatch(Action.NoFeeFound);
      logger.notify(`Negative fee calculated for session ${sessionId}`);
      return;
    }

    // Do not contact payment provider at all if fee is 0, just show UI
    if (fee === 0) {
      dispatch(Action.ZeroFee);
      return;
    }

    // If props.fn is undefined, display & log an error
    if (isNaN(fee)) {
      dispatch(Action.NoFeeFound);
      logger.notify(`Unable to calculate fee for session ${sessionId}`);
      return;
    }

    if (!hasExistingPayment) {
      dispatch(Action.NoPaymentFound);
      return;
    }

    if (govUkPayment?.state.status === "success") {
      actions.handleSuccess();
    } else {
      actions.refetchPayment();
    }
  }, []);

  const continueWithoutPaying = () => {
    props.handleSubmit && props.handleSubmit({ auto: false });
  };

  const onConfirm = () => {
    const shouldContinueWithoutPaying =
      fee === 0 || props.hidePay || state.status === "unsupported_team";

    if (shouldContinueWithoutPaying) continueWithoutPaying();
    if (["no_payment_found", "init"].includes(state.status))
      actions.startNewPayment();
    if (state.status === "retry") actions.resumeExistingPayment();
    if (state.status === "status_unknown") actions.refetchPayment();
  };

  const getButtonTitle = () => {
    switch (state.status) {
      case "retry":
        return "Retry payment";
      case "status_unknown":
        return "Check payment status";
      default:
        return "Pay now";
    }
  };

  return (
    <>
      {state.status === "no_payment_found" ||
      state.status === "init" ||
      state.status === "retry" ||
      state.status === "status_unknown" ||
      state.status === "unsupported_team" ||
      state.status === "undefined_fee" ||
      state.status === "zero_fee" ? (
        <Confirm
          {...props}
          fee={fee}
          onConfirm={onConfirm}
          buttonTitle={getButtonTitle()}
          warning={
            (state.status === "status_unknown" &&
              "We could not check the status of your payment. If you have already paid, checking again will confirm your payment.") ||
            undefined
          }
          error={
            (state.status === "unsupported_team" &&
              "Online payments are not enabled for this local authority") ||
            (state.status === "undefined_fee" &&
              "We are unable to calculate your fee right now") ||
            undefined
          }
          showInviteToPay={showPayOptions && isTeamSupported}
          paymentStatus={govUkPayment?.state?.status}
        />
      ) : (
        <DelayedLoadingIndicator text={state.displayText || state.status} />
      )}
    </>
  );
}
