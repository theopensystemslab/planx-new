import { makeStyles } from "@material-ui/core/styles";
import { makeData } from "@planx/components/shared/utils";
import axios from "axios";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useReducer } from "react";
import type { GovUKPayment } from "types";

import { createPayload, Pay } from "../model";
import { toDecimal } from "../model";
import Confirm from "./Confirm";

export default Component;

const useStyles = makeStyles((theme) => ({
  banner: {
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    textAlign: "center",
    padding: theme.spacing(4),
    width: "100%",
    marginTop: theme.spacing(3),
    "& p": {
      textAlign: "left",
    },
    "& a": {
      color: theme.palette.primary.contrastText,
    },
    "& .marginBottom": {
      marginBottom: theme.spacing(3),
    },
  },
}));

interface Props extends Pay {
  handleSubmit: handleSubmit;
  url?: string;
  fn?: string;
}

// TODO: Does this need an error state if we have a good ErrorBoundary?
type ComponentState =
  | "indeterminate"
  | "init"
  | "redirecting"
  | "fetching_payment"
  | "retry"
  | "success";

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

  if (!props.url) throw new Error("Missing Gov.UK Pay URL");

  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;

  const handleSuccess = () => {
    dispatch(Action.Success);
    props.handleSubmit(makeData(props, govUkPayment, "payment"));
  };

  const reducer = (state: ComponentState, action: Action): ComponentState => {
    switch (action) {
      case Action.NoPaymentFound:
        return "init";
      case Action.IncompletePaymentFound:
        return "fetching_payment";
      case Action.IncompletePaymentConfirmed:
        return "retry";
      case Action.StartNewPayment:
        return "redirecting";
      case Action.ResumePayment:
        return "redirecting";
      case Action.Success:
        return "success";
    }
  };

  const [state, dispatch] = useReducer(reducer, "indeterminate");

  useEffect(() => {
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
      .get(props.url + `/${id}`)
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
    if (!govUkPayment) throw new Error("");

    dispatch(Action.ResumePayment);

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

    // TODO: why isn't ErrorBoundary catching the errors I throw in here?
    if (!props.url) throw new Error("Missing GovUK Pay URL");

    await axios
      .post(props.url, createPayload(fee, id))
      .then((res) => {
        const payment = updatePayment(res.data);

        if (payment._links.next_url?.href)
          window.location.replace(payment._links.next_url.href);
      })
      .catch((e) => {
        throw e;
      });
  };

  // TODO: ask gunar & john about this:
  // TODO: When connecting this component to the flow and to the backend
  //       remember to also pass up the value of `otherPayments`
  //       to be stored in special data fields, e.g.
  //       - feedback.payment.type
  //       - feedback.payment.reason

  return (
    <>
      {state === "init" || state === "retry" ? (
        <Confirm
          {...props}
          fee={fee}
          onConfirm={() => {
            state === "init" ? startNewPayment() : resumeExistingPayment();
          }}
          buttonTitle={
            state === "init" ? "Pay using GOV.UK Pay" : "Retry payment"
          }
        />
      ) : (
        <DelayedLoadingIndicator text={state} />
      )}
    </>
  );
}
