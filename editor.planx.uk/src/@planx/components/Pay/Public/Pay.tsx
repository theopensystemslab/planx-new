import {
  GOV_PAY_PASSPORT_KEY,
  GovUKPayment,
  PaymentStatus,
} from "@opensystemslab/planx-core/types";
import { logger } from "airbrake";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { setLocalFlow } from "lib/local.new";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useReducer } from "react";
import { useErrorHandler } from "react-error-boundary";
import type { Session } from "types";

import { makeData } from "../../shared/utils";
import { createPayload, GOV_UK_PAY_URL, Pay, toDecimal } from "../model";
import Confirm from "./Confirm";

export default Component;
interface Props extends Pay {
  handleSubmit: handleSubmit;
}

type ComponentState =
  | { status: "indeterminate"; displayText?: string }
  | { status: "init" }
  | { status: "redirecting"; displayText?: string }
  | { status: "fetching_payment"; displayText?: string }
  | { status: "retry" }
  | { status: "success"; displayText?: string }
  | { status: "unsupported_team" }
  | { status: "undefined_fee" };

enum Action {
  NoFeeFound,
  NoPaymentFound,
  IncompletePaymentFound,
  IncompletePaymentConfirmed,
  StartNewPayment,
  StartNewPaymentError,
  ResumePayment,
  Success,
}

export const PAY_API_ERROR_UNSUPPORTED_TEAM =
  "GOV.UK Pay is not enabled for this local authority";

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
    flowSlug,
  ] = useStore((state) => [
    state.id,
    state.sessionId,
    state.breadcrumbs,
    state.govUkPayment,
    state.setGovUkPayment,
    state.computePassport(),
    state.previewEnvironment,
    state.teamSlug,
    state.flowSlug,
  ]);
  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;
  const defaultMetadata = [
    { key: "source", value: "PlanX" },
    { key: "flow", value: flowSlug },
    { key: "isInviteToPay", value: false },
  ];
  const metadata = props.govPayMetadata?.length
    ? props.govPayMetadata
    : defaultMetadata;

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
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    status: "indeterminate",
    displayText: "Loading...",
  });

  const handleError = useErrorHandler();

  useEffect(() => {
    // Auto-skip component when fee=0
    if (fee <= 0) {
      return props.handleSubmit({ auto: true });
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
    props.handleSubmit(makeData(props, govUkPayment, GOV_PAY_PASSPORT_KEY));
  };

  const normalizePaymentResponse = (responseData: any): GovUKPayment => {
    if (!responseData?.state?.status)
      throw new Error("Corrupted response from GOV.UK");
    const payment: GovUKPayment = { ...responseData };
    payment.amount = toDecimal(payment.amount);
    return payment;
  };

  const resolvePaymentResponse = async (
    responseData: any,
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
      const {
        data: { state },
      } = await axios.get<Pick<GovUKPayment, "state">>(
        getGovUkPayUrlForTeam({
          sessionId,
          flowId,
          teamSlug,
          paymentId: govUkPayment?.payment_id,
        }),
      );

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
    await axios
      .post(
        getGovUkPayUrlForTeam({ sessionId, flowId, teamSlug }),
        createPayload(fee, sessionId, metadata),
      )
      .then(async (res) => {
        const payment = await resolvePaymentResponse(res.data);
        if (payment._links.next_url?.href)
          window.location.replace(payment._links.next_url.href);
      })
      .catch((error) => {
        if (
          error.response?.data?.error?.startsWith(
            PAY_API_ERROR_UNSUPPORTED_TEAM,
          )
        ) {
          // Show a custom message if this team isn't set up to use Pay yet
          dispatch(Action.StartNewPaymentError);
        } else {
          const apiErrorMessage: string | undefined =
            error.response?.data?.error;
          // Throw all other errors so they're caught by our ErrorBoundary
          handleError(apiErrorMessage ? { message: apiErrorMessage } : error);
        }
      });
  };

  return (
    <>
      {state.status === "init" ||
      state.status === "retry" ||
      state.status === "unsupported_team" ||
      state.status === "undefined_fee" ? (
        <Confirm
          {...props}
          fee={fee}
          onConfirm={() => {
            if (props.hidePay || state.status === "unsupported_team") {
              // Show "Continue" button to proceed
              props.handleSubmit({ auto: false });
            } else if (state.status === "init") {
              startNewPayment();
            } else if (state.status === "retry") {
              resumeExistingPayment();
            }
          }}
          buttonTitle={
            state.status === "init"
              ? "Pay now using GOV.UK Pay"
              : "Retry payment"
          }
          error={
            (state.status === "unsupported_team" &&
              "GOV.UK Pay is not enabled for this local authority") ||
            (state.status === "undefined_fee" &&
              "We are unable to calculate your fee right now") ||
            undefined
          }
          showInviteToPay={
            props.allowInviteToPay &&
            !props.hidePay &&
            state.status !== "unsupported_team"
          }
          paymentStatus={govUkPayment?.state?.status}
          hidePay={props.hidePay}
        />
      ) : (
        <DelayedLoadingIndicator text={state.displayText || state.status} />
      )}
    </>
  );
}

async function saveSession(session: Session) {
  await setLocalFlow(session.sessionId, session);
}

function getGovUkPayUrlForTeam({
  sessionId,
  flowId,
  teamSlug,
  paymentId,
}: {
  sessionId: string;
  flowId: string;
  teamSlug: string;
  paymentId?: string;
}): string {
  const baseURL = `${GOV_UK_PAY_URL}/${teamSlug}`;
  const queryString = `?sessionId=${sessionId}&flowId=${flowId}`;
  if (paymentId) {
    return `${baseURL}/${paymentId}${queryString}`;
  }
  return `${baseURL}${queryString}`;
}
