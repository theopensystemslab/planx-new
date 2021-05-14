import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { makeData } from "@planx/components/shared/utils";
import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useReducer } from "react";
import type { GovUKPayment } from "types";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import { createPayload, Pay } from "../model";
import { ComponentState, Event,reducer, toDecimal } from "../model";
import Init from "./Init";

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

  const classes = useStyles();

  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;

  const [state, dispatch] = useReducer(reducer, "loading");

  useEffect(() => {
    if (!govUkPayment) {
      dispatch(Event.NoPaymentFound);
      return;
    }

    switch (govUkPayment.state.status) {
      case "success":
        dispatch(Event.Success);
        props.handleSubmit(makeData(props, govUkPayment, "payment"));
        break;
      case "cancelled":
      case "capturable":
      case "created":
      case "error":
      case "failed":
      case "started":
      case "submitted":
        dispatch(Event.IncompletePaymentFound);
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
    await axios.get(props.url + `/${id}`).then((res) => {
      const payment = updatePayment(res.data);

      if (payment.state.status === "success") {
        dispatch(Event.Success);
        props.handleSubmit(makeData(props, govUkPayment, "payment"));
      }
    });
  };

  const resumeExistingPayment = async () => {
    if (!govUkPayment) throw new Error("");

    dispatch(Event.ResumePayment);

    switch (govUkPayment.state.status) {
      case "cancelled":
      case "error":
      case "failed":
        startNewPayment();
        break;
      case "created":
      case "submitted":
        if (govUkPayment._links.next_url?.href)
          window.location.replace(govUkPayment._links.next_url.href);
    }
  };

  const startNewPayment = async () => {
    dispatch(Event.StartNewPayment);

    // Skip the redirect process if viewing this within the Editor
    if (environment !== "standalone") {
      dispatch(Event.Success);
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
    <Box textAlign="left" width="100%">
      <Container maxWidth="md">
        <Typography variant="h1" gutterBottom align="left">
          {props.title}
        </Typography>
      </Container>

      <div className={classes.banner}>
        <Container maxWidth="md">
          <Typography variant="h5" gutterBottom className="marginBottom">
            The planning fee for this application is
          </Typography>
          <Typography variant="h1" gutterBottom className="marginBottom">
            {`£${fee.toFixed(2)}`}
          </Typography>

          <Typography variant="h4">
            <ReactMarkdownOrHtml source={props.description} />
          </Typography>
        </Container>
      </div>

      <Card>
        {/* TODO: Remove these; they're just useful for debugging */}
        <Typography variant="h4">State {state}</Typography>
        <Typography variant="h5">
          Payment Status{" "}
          {govUkPayment ? govUkPayment.state.status : "No payment found"}
        </Typography>

        {state === "init" ? (
          <Init
            startPayment={() => {
              startNewPayment();
            }}
          />
        ) : state === "incomplete" ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={resumeExistingPayment}
          >
            Retry Payment
          </Button>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Card>
    </Box>
  );
}
