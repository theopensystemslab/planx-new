import { airbrake } from "airbrake";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useReducer } from "react";
import type { GovUKPayment } from "types";

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
    sessionId,
    govUkPayment,
    setGovUkPayment,
    passport,
    environment,
    sendSessionDataToHasura,
  ] = useStore((state) => [
    state.sessionId,
    state.govUkPayment,
    state.setGovUkPayment,
    state.computePassport(),
    state.previewEnvironment,
    state.sendSessionDataToHasura,
  ]);

  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;

  const teamSlug = useTeamSlug();
  const govUkPayUrlForTeam = useStagingUrlIfTestApplication(passport)(
    `${GOV_UK_PAY_URL}/${teamSlug}`
  );

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

    if (govUkPayment.state.status === "success") {
      handleSuccess();
    } else {
      dispatch(Action.IncompletePaymentFound);
      refetchPayment(govUkPayment.payment_id);
    }
  }, []);

  // if this is the public-facing preview and Pay component is loading
  if (environment === "standalone" && state.status === "indeterminate") {
    // XXX: When the pay component is initially loaded, send the user's
    //      session info to storage in case there's an issue with payment flow.
    //      Will be called when this component is shown, or if it's skipped.
    //      Will fail silently if there's an issue with the HTTP request.
    sendSessionDataToHasura();
  }

  const handleSuccess = () => {
    dispatch(Action.Success);
    props.handleSubmit(makeData(props, govUkPayment, GOV_PAY_PASSPORT_KEY));
  };

  const updatePayment = (responseData: any): GovUKPayment => {
    const payment: GovUKPayment = responseData;

    const normalizedPayment = {
      ...payment,
      amount: toDecimal(payment.amount),
    };

    setGovUkPayment(normalizedPayment);

    return normalizedPayment;
  };

  const refetchPayment = async (id: string) => {
    try {
      const {
        data: { state },
      } = await axios.get<
        // API response has sensitive info filtered out
        Pick<GovUKPayment, "payment_id" | "amount" | "state">
      >(`${govUkPayUrlForTeam}/${id}`);

      if (!state.status) throw new Error("Corrupted response from GOV.UK");

      // Update local state with the refetched payment state
      if (govUkPayment) setGovUkPayment({ ...govUkPayment, state });

      switch (state.status) {
        case "success":
          handleSuccess();
          break;
        default:
          dispatch(Action.IncompletePaymentConfirmed);
      }
    } catch (err) {
      // XXX: There's probably been an issue fetching the payment status,
      //      but there's a chance that the user might've made a successful
      //      payment. We silently log the error and the service continues.
      airbrake?.notify(err);
      console.error(err);
    }
  };

  const resumeExistingPayment = async () => {
    dispatch(Action.ResumePayment);

    if (!govUkPayment) {
      startNewPayment();
      return;
    }

    switch (govUkPayment.state.status) {
      case "cancelled":
      case "error":
      case "failed":
        startNewPayment();
        break;
      case "started":
      case "created":
      case "submitted":
        if (govUkPayment._links.next_url?.href)
          window.location.replace(govUkPayment._links.next_url.href);
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
      .post(govUkPayUrlForTeam, createPayload(fee, sessionId))
      .then((res) => {
        const payment = updatePayment(res.data);

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
            state.status === "init" ? "Pay using GOV.UK Pay" : "Retry payment"
          }
          error={
            state.status === "unsupported_team"
              ? "GOV.UK Pay is not enabled for this local authority"
              : undefined
          }
        />
      ) : (
        <DelayedLoadingIndicator text={state.displayText || state.status} />
      )}
    </>
  );
}
