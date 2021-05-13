import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import Checkbox from "@material-ui/core/Checkbox";
import Container from "@material-ui/core/Container";
import Drawer from "@material-ui/core/Drawer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Card from "@planx/components/shared/Preview/Card";
import { makeData } from "@planx/components/shared/utils";
import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { useEffect } from "react";
import { useAsync } from "react-use";
import type { GovUKPayment } from "types";
import Input from "ui/Input";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import { createPayload, GovUKCreatePaymentPayload, Pay } from "../model";
import { toDecimal, toPence } from "../model";
import Init from "./Init";

export default Component;

const useStyles = makeStyles((theme) => ({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
    },
  },
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
  drawerPaper: {
    boxSizing: "border-box",
    width: 300,
    [theme.breakpoints.only("xs")]: {
      width: "100%",
    },
    backgroundColor: theme.palette.background.default,
    border: 0,
    boxShadow: "-4px 0 0 rgba(0,0,0,0.1)",
    padding: theme.spacing(2),
  },
  link: {
    color: theme.palette.primary.main,
    textDecoration: "underline",
    cursor: "pointer",
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

  const [state, setState] = React.useState<"init" | "sending" | "sent">(
    govUkPayment ? "init" : "sent"
  );

  if (!props.url) throw new Error("Missing Gov.UK Pay URL");

  const classes = useStyles();

  if (govUkPayment) {
    switch (govUkPayment.state.status) {
      case "created":
        axios.get(props.url + `/${govUkPayment.payment_id}`).then((res) => {
          console.log(res.data);
          const payment: GovUKPayment = res.data;
          if (payment.state.status === "success") {
            props.handleSubmit(makeData(props, res.data, "payment"));
          }
        });
        break;
      case "cancelled":
      // TODO: display message to user that payment was cancelled; do not proceed with application
      case "submitted":
      // TODO: figure out what even to do with this one; probably thow an error
      case "error":
      case "failed":
        throw new Error("Payment failed");
    }
  }

  const fee = props.fn ? Number(passport.data?.[props.fn]) : 0;

  const payload = createPayload(fee, id);

  const handlePayment = async () => {
    setState("sending");

    // TODO: why isn't ErrorBoundary catching the errors I throw in here?
    if (!props.url) throw new Error("Missing GovUK Pay URL");

    const request = await axios
      .post(props.url, payload)
      .then((res) => {
        console.log(res);
        const payment: GovUKPayment = res.data;

        const normalizedPayment = {
          ...payment,
          amount: toDecimal(payment.amount),
        };

        setGovUkPayment(normalizedPayment);
        console.log(payment);

        window.location.replace(payment._links.next_url.href);
      })
      .catch((e) => {
        throw e;
      });
  };

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
        {state === "init" ? (
          <Init
            startPayment={() => {
              setState(environment === "standalone" ? "sending" : "sent");
              handlePayment();
            }}
          />
        ) : (
          <Typography>
            {state === "sending"
              ? "Loading..."
              : `Payment Status: ${govUkPayment?.state.status.toLocaleUpperCase()}`}
          </Typography>
        )}
      </Card>
    </Box>
  );
}
