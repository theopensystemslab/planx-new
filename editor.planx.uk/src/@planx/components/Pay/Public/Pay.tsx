import { logger } from "airbrake";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { hasFeatureFlag } from "lib/featureFlags";
import { setLocalFlow } from "lib/local.new";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useReducer } from "react";
import type { GovUKPayment, Passport, Session } from "types";
import { PaymentStatus } from "types";

import { useTeamSlug } from "../../shared/hooks";
import { makeData, useStagingUrlIfTestApplication } from "../../shared/utils";
import {
  createPayload,
  GOV_PAY_PASSPORT_KEY,
  GOV_UK_PAY_URL,
  Pay,
  toDecimal,
} from "../model";
import Confirm from "./Confirm";

export default Component;
interface Props extends Pay {
  handleSubmit: handleSubmit;
  fn?: string;
}

type ComponentState =
  | { status: "indeterminate"; displayText?: string }
  | { status: "init" }
  | { status: "redirecting"; displayText?: string }
  | { status: "fetching_payment"; displayText?: string }
  | { status: "retry" }
  | { status: "success"; displayText?: string }
  | { status: "unsupported_team" };

enum Action {
  NoPaymentFound,
  IncompletePaymentFound,
  IncompletePaymentConfirmed,
  StartNewPayment,
  StartNewPaymentError,
  ResumePayment,
  Success,
}

function Component(props: Props) {
  const [
    flowId,
    sessionId,
    breadcrumbs,
    govUkPayment,
    setGovUkPayment,
    passport,
    environment,
  ] = useStore((state) => [
    state.id,
    state.sessionId,
    state.breadcrumbs,
    state.govUkPayment,
    state.setGovUkPayment,
    state.computePassport(),
    state.previewEnvironment,
  ]);
  const teamSlug = useTeamSlug();
  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;

  // Handles UI states
  const reducer = (_state: ComponentState, action: Action): ComponentState => {
    switch (action) {
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

  useEffect(() => {
    if (isNaN(fee) || fee <= 0) {
      // skip the pay component because there's no fee to charge
      return props.handleSubmit({ auto: true });
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
    let payment: GovUKPayment = { ...responseData };
    payment.amount = toDecimal(payment.amount);
    return payment;
  };

  const resolvePaymentResponse = async (
    responseData: any
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
          passport,
          paymentId: govUkPayment?.payment_id,
        })
      );

      // Update local state with the refetched payment state
      if (govUkPayment) {
        const payment = await resolvePaymentResponse({
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
        getGovUkPayUrlForTeam({ sessionId, flowId, teamSlug, passport }),
        createPayload(fee, sessionId)
      )
      .then(async (res) => {
        const payment = await resolvePaymentResponse(res.data);
        if (payment._links.next_url?.href)
          window.location.replace(payment._links.next_url.href);
      })
      .catch((error) => {
        if (error.response?.data?.error?.endsWith("local authority")) {
          // Show a custom message if this team isn't set up to use Pay yet
          dispatch(Action.StartNewPaymentError);
        } else {
          // Throw all other errors so they're caught by our ErrorBoundary
          throw error;
        }
      });
  };

  return (
    <>
      {state.status === "init" ||
      state.status === "retry" ||
      state.status === "unsupported_team" ? (
        <Confirm
          {...props}
          fee={fee}
          onConfirm={() => {
            if (state.status === "init") {
              startNewPayment();
            } else if (state.status === "retry") {
              resumeExistingPayment();
            } else if (state.status === "unsupported_team") {
              // Allow "Continue" button to skip Pay
              props.handleSubmit({ auto: true });
            }
          }}
          buttonTitle={
            state.status === "init"
              ? "Pay now using GOV.UK Pay"
              : "Retry payment"
          }
          error={
            state.status === "unsupported_team"
              ? "GOV.UK Pay is not enabled for this local authority"
              : undefined
          }
          showInviteToPay={
            props.allowInviteToPay &&
            state.status !== "unsupported_team" &&
            hasFeatureFlag("INVITE_TO_PAY")
          }
          paymentStatus={govUkPayment?.state?.status}
        />
      ) : (
        <DelayedLoadingIndicator text={state.displayText || state.status} />
      )}
      {/* session id exposed for testing purposes */}
      <span data-testid="sessionId" data-sessionid={sessionId}></span>
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
  passport,
  paymentId,
}: {
  sessionId: string;
  flowId: string;
  teamSlug: string;
  passport: Passport;
  paymentId?: string;
}): string {
  const baseURL = useStagingUrlIfTestApplication(passport)(
    `${GOV_UK_PAY_URL}/${teamSlug}`
  );
  const queryString = `?sessionId=${sessionId}&flowId=${flowId}`;
  if (paymentId) {
    return `${baseURL}/${paymentId}${queryString}`;
  }
  return `${baseURL}${queryString}`;
}
