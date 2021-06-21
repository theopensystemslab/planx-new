import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useReducer } from "react";
import type { GovUKPayment } from "types";

import { useTeamSlug } from "../../shared/hooks";
import { makeData } from "../../shared/utils";
import { createPayload, GOV_UK_PAY_URL, Pay, toDecimal } from "../model";
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
  | { status: "success"; displayText?: string };

enum Action {
  NoPaymentFound,
  IncompletePaymentFound,
  IncompletePaymentConfirmed,
  StartNewPayment,
  ResumePayment,
  Success,
}

function Component(props: Props) {
  const [
    id,
    govUkPayment,
    setGovUkPayment,
    passport,
    environment,
  ] = useStore((state) => [
    state.id,
    state.govUkPayment,
    state.setGovUkPayment,
    state.computePassport(),
    state.previewEnvironment,
  ]);

  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;

  const teamSlug = useTeamSlug();
  const govUkPayUrlForTeam = `${GOV_UK_PAY_URL}/${teamSlug}`;

  // Handles UI states
  const reducer = (state: ComponentState, action: Action): ComponentState => {
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
    if (fee <= 0) {
      handleSuccess();
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

  const handleSuccess = () => {
    dispatch(Action.Success);
    props.handleSubmit(makeData(props, govUkPayment, "payment"));
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
    await axios
      .get(`${govUkPayUrlForTeam}/${id}`)
      .then((res) => {
        const payment = updatePayment(res.data);

        if (!payment.state.status)
          throw new Error("Corrupted response from GOV.UK");

        switch (payment.state.status) {
          case "success":
            handleSuccess();
            break;
          case "submitted":
          case "started":
          case "failed":
          case "created":
          case "capturable":
          case "cancelled":
          case "error":
            dispatch(Action.IncompletePaymentConfirmed);
        }
      })
      .catch((e) => {
        throw e;
      });
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
      .post(govUkPayUrlForTeam, createPayload(fee, id))
      .then((res) => {
        const payment = updatePayment(res.data);

        if (payment._links.next_url?.href)
          window.location.replace(payment._links.next_url.href);
      })
      .catch((e) => {
        throw e;
      });
  };

  return (
    <>
      {state.status === "init" || state.status === "retry" ? (
        <Confirm
          {...props}
          fee={fee}
          onConfirm={() => {
            state.status === "init"
              ? startNewPayment()
              : resumeExistingPayment();
          }}
          buttonTitle={
            state.status === "init" ? "Pay using GOV.UK Pay" : "Retry payment"
          }
        />
      ) : (
        <DelayedLoadingIndicator text={state.displayText || state.status} />
      )}
    </>
  );
}
