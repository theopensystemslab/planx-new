import {
  GOV_PAY_PASSPORT_KEY,
  GovUKPayment,
  PaymentStatus,
} from "@opensystemslab/planx-core/types";
import { PublicProps } from "@planx/components/shared/types";
import { logger } from "airbrake";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import type { APIError } from "lib/api/client";
import { getPayment, initiatePayment } from "lib/api/pay/requests";
import { saveSession } from "lib/local.new";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useReducer } from "react";
import { useErrorHandler } from "react-error-boundary";

import { makeData } from "../../shared/utils";
import { createPayload, getDefaultContent, Pay } from "../model";
import Confirm from "./Confirm";

export default Component;
export type Props = PublicProps<Pay>;

type ComponentState =
  | { status: "indeterminate"; displayText?: string }
  | { status: "init" }
  | { status: "redirecting"; displayText?: string }
  | { status: "fetching_payment"; displayText?: string }
  | { status: "retry" }
  | { status: "success"; displayText?: string }
  | { status: "unsupported_team" }
  | { status: "undefined_fee" }
  | { status: "zero_fee" };

enum Action {
  NoFeeFound,
  NoPaymentFound,
  IncompletePaymentFound,
  IncompletePaymentConfirmed,
  StartNewPayment,
  StartNewPaymentError,
  ResumePayment,
  Success,
  ZeroFee,
}

export const PAY_API_ERROR_UNSUPPORTED_TEAM = "GOV.UK Pay is not enabled for";

function Component(props: Props) {
  const [
    flowId,
    sessionId,
    breadcrumbs,
    govUkPayment,
    setGovUkPayment,
    passport,
    environment,
    teamSlug,
  ] = useStore((state) => [
    state.id,
    state.sessionId,
    state.breadcrumbs,
    state.govUkPayment,
    state.setGovUkPayment,
    state.computePassport(),
    state.previewEnvironment,
    state.teamSlug,
  ]);
  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;

  const defaultMetadata = getDefaultContent().govPayMetadata;

  const metadata = [...(props.govPayMetadata || []), ...defaultMetadata];

  // Handles UI states
  const reducer = (_state: ComponentState, action: Action): ComponentState => {
    switch (action) {
      case Action.NoFeeFound:
        return { status: "undefined_fee" };
      case Action.NoPaymentFound:
        return { status: "init" };
      case Action.IncompletePaymentFound:
        return {
          status: "fetching_payment",
          displayText: "Loading payment information",
        };
      case Action.IncompletePaymentConfirmed:
        return { status: "retry" };
      case Action.StartNewPayment:
        return {
          status: "redirecting",
          displayText: "Connecting you to GOV.UK Pay",
        };
      case Action.StartNewPaymentError:
        return { status: "unsupported_team" };
      case Action.ResumePayment:
        return {
          status: "redirecting",
          displayText: "Reconnecting to GOV.UK Pay",
        };
      case Action.Success:
        return { status: "success", displayText: "Payment Successful" };
      case Action.ZeroFee:
        return { status: "zero_fee" };
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    status: "indeterminate",
    displayText: "Loading...",
  });

  const handleError = useErrorHandler();

  const isTeamSupported =
    state.status !== "unsupported_team" && teamSlug !== "demo";
  const showPayOptions = props.allowInviteToPay && !props.hidePay;

  useEffect(() => {
    // Skip component when fee is negative
    // Log error silently - this was likely a content error that should be addressed
    if (fee < 0) {
      dispatch(Action.NoFeeFound);
      logger.notify(`Negative fee calculated for session ${sessionId}`);
      return;
    }

    // Do not contact GovPay at all if fee is 0, just show UI
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

    if (!govUkPayment) {
      dispatch(Action.NoPaymentFound);
      return;
    }

    if (govUkPayment.state.status === PaymentStatus.success) {
      handleSuccess();
    } else {
      dispatch(Action.IncompletePaymentFound);
      refetchPayment();
    }
  }, []);

  const handleSuccess = () => {
    dispatch(Action.Success);
    props.handleSubmit &&
      props.handleSubmit(makeData(props, govUkPayment, GOV_PAY_PASSPORT_KEY));
  };

  const normalizePaymentResponse = (
    responseData: GovUKPayment,
  ): GovUKPayment => {
    if (!responseData?.state?.status)
      throw new Error("Corrupted response from GOV.UK");
    return responseData;
  };

  const resolvePaymentResponse = async (
    responseData: GovUKPayment,
  ): Promise<GovUKPayment> => {
    const payment = normalizePaymentResponse(responseData);
    setGovUkPayment(payment);
    // save a record of the session with the latest payment for debugging purposes
    await saveSession({
      breadcrumbs,
      id: flowId,
      passport,
      sessionId,
      govUkPayment: payment,
    });
    return payment;
  };

  const refetchPayment = async () => {
    try {
      const paymentId = govUkPayment?.payment_id;
      if (!paymentId) return;

      const { state } = await getPayment({
        teamSlug,
        sessionId,
        flowId,
        paymentId,
      });

      // Update local state with the refetched payment state
      if (govUkPayment) {
        await resolvePaymentResponse({
          ...govUkPayment,
          state,
        });
        if (state.status === PaymentStatus.success) {
          handleSuccess();
          return;
        }
      }
      dispatch(Action.IncompletePaymentConfirmed);
    } catch (err) {
      // XXX: There's probably been an issue fetching the payment status,
      //      but there's a chance that the user might've made a successful
      //      payment. We silently log the error and the service continues.
      logger.notify(err);
    }
  };

  const resumeExistingPayment = async () => {
    dispatch(Action.ResumePayment);

    if (!govUkPayment) {
      await startNewPayment();
      return;
    }

    switch (govUkPayment.state.status) {
      case PaymentStatus.cancelled:
      case PaymentStatus.error:
      case PaymentStatus.failed: {
        await startNewPayment();
        break;
      }
      case PaymentStatus.started:
      case PaymentStatus.created:
      case PaymentStatus.submitted: {
        if (govUkPayment._links.next_url?.href) {
          window.location.replace(govUkPayment._links.next_url.href);
        } else {
          logger.notify("Payment did not include a 'next_url' link.");
        }
        break;
      }
      default: {
        logger.notify("Unhandled payment status");
      }
    }
  };

  const startNewPayment = async () => {
    dispatch(Action.StartNewPayment);

    // Skip the redirect process if viewing this within the Editor
    if (environment !== "standalone") {
      handleSuccess();
      return;
    }

    const payload = createPayload(fee, sessionId, metadata, passport);
    await initiatePayment({
      teamSlug,
      flowId,
      sessionId,
      payload,
    })
      .then(async (data) => {
        const payment = await resolvePaymentResponse(data);
        if (payment._links.next_url?.href)
          window.location.replace(payment._links.next_url.href);
      })
      .catch((error: APIError<{ error: string }>) => {
        const apiErrorMessage = error.data.error;

        if (apiErrorMessage.startsWith(PAY_API_ERROR_UNSUPPORTED_TEAM)) {
          // Show a custom message if this team isn't set up to use Pay yet
          dispatch(Action.StartNewPaymentError);
        } else {
          // Throw all other errors so they're caught by our ErrorBoundary
          handleError(apiErrorMessage ? { message: apiErrorMessage } : error);
        }
      });
  };

  const continueWithoutPaying = () => {
    props.handleSubmit && props.handleSubmit({ auto: false });
  };

  const onConfirm = () => {
    const shouldContinueWithoutPaying =
      fee === 0 || props.hidePay || state.status === "unsupported_team";

    if (shouldContinueWithoutPaying) continueWithoutPaying();
    if (state.status === "init") startNewPayment();
    if (state.status === "retry") resumeExistingPayment();
  };

  return (
    <>
      {state.status === "init" ||
      state.status === "retry" ||
      state.status === "unsupported_team" ||
      state.status === "undefined_fee" ||
      state.status === "zero_fee" ? (
        <Confirm
          {...props}
          fee={fee}
          onConfirm={onConfirm}
          buttonTitle={
            state.status === "init"
              ? "Pay now using GOV.UK Pay"
              : "Retry payment"
          }
          error={
            (teamSlug === "demo" &&
              "GOV.UK Pay is not enabled for demo users") ||
            (state.status === "unsupported_team" &&
              "GOV.UK Pay is not enabled for this local authority") ||
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
