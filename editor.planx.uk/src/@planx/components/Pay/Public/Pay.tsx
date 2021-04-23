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
import DecisionButton from "@planx/components/shared/Buttons/DecisionButton";
import Card from "@planx/components/shared/Preview/Card";
import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { Suspense, useEffect } from "react";
import { useAsync } from "react-use";
import type { GovUKPayment } from "types";
import Input from "ui/Input";

import type { GovUKCreatePaymentPayload, Pay } from "../model";

export default Component;

const useStyles = makeStyles((theme) => ({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
    },
  },
  banner: {
    background: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
    textAlign: "center",
    padding: theme.spacing(4),
    width: "100%",
    marginTop: theme.spacing(1),
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
}));

interface Props extends Pay {
  handleSubmit: handleSubmit;
  url?: string;
  fn?: string;
}

function Component(props: Props) {
  const [id, passport, mutatePassport] = useStore((state) => [
    state.id,
    state.passport,
    state.mutatePassport,
  ]);
  const [state, setState] = React.useState<"init" | "paying" | "paid">(
    passport.data.payment ? "paid" : "init"
  );

  const classes = useStyles();

  // TODO: Implement a nicer design for when a user returns to PlanX from GOV.UK;
  // possibly as a service worker or something that lives above flow components
  useEffect(() => {
    if (state === "paid") {
      props.handleSubmit();
    }
  }, [state]);

  const fee = props.fn ? Number(passport.data[props.fn]?.value[0]) : 0;

  // TODO: When connecting this component to the flow and to the backend
  //       remember to also pass up the value of `otherPayments`
  //       to be stored in special data fields, e.g.
  //       - feedback.payment.type
  //       - feedback.payment.reason

  return (
    <Box textAlign="left" width="100%">
      <Container maxWidth="md">
        <Typography variant="h1" gutterBottom align="left">
          Pay for your application
        </Typography>
      </Container>

      <div className={classes.banner}>
        <Container maxWidth="md">
          <Typography variant="h5" gutterBottom className="marginBottom">
            The planning fee for this application is
          </Typography>
          <Typography variant="h1" gutterBottom className="marginBottom">
            {`£${fee}`}
          </Typography>
          <Typography variant="body1" align="left">
            The planning fee covers the cost of processing your application.
            Find out more about how planning fees are calculated{" "}
            <a href="#">here</a>.
          </Typography>
        </Container>
      </div>

      <Card>
        {props.url && state === "paying" ? (
          <GovUkTemporaryComponent
            url={props.url}
            amount={fee}
            flowId={id}
            handleResponse={(response) => {
              mutatePassport((draft) => {
                const normalizedPayment = {
                  ...response,
                  amount: response.amount / 100,
                };
                draft.data["payment"] = normalizedPayment;
              });

              try {
                window.location.replace(response._links.next_url.href);
              } catch (e) {
                throw e;
              }
            }}
          />
        ) : (
          <Init
            amount={fee}
            startPayment={() => setState("paying")}
            {...props}
          />
        )}
      </Card>
    </Box>
  );
}

function Init(props: any) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography variant="h3">How to pay</Typography>
      <Box py={3}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={props.startPayment}
        >
          Pay using GOV.UK Pay
        </Button>
      </Box>

      <SuggestionDrawer />
    </div>
  );
}

function GovUkTemporaryComponent(props: {
  url: string;
  amount: number;
  flowId: string;
  handleResponse: (response: GovUKPayment) => void;
}): JSX.Element | null {
  const params: GovUKCreatePaymentPayload = {
    // TODO: move this into model & test it; messy to keep it here
    amount: Math.trunc(props.amount * 100),
    reference: props.flowId,
    description: "New application",
    return_url: window.location.href,
  };

  console.log("params", params);
  const request = useAsync(async () => axios.post(props.url, params));

  useEffect(() => {
    if (!request.loading && !request.error && request.value) {
      props.handleResponse(request.value.data as GovUKPayment);
    }
  }, [request.loading, request.error, request.value]);

  if (request.loading) {
    return <Typography>Loading...</Typography>;
  } else if (request.error) {
    throw request.error;
  }

  return null;
}

function SuggestionDrawer() {
  const OTHER_OPTIONS = [
    { name: "Apple", label: "Apple Pay" },
    { name: "BACs", label: "Bank transfer by BACs" },
    { name: "Cheque", label: "Cheque" },
    { name: "PayPal", label: "PayPal" },
    { name: "Phone", label: "Phone" },
    { name: "Other", label: "Other" },
  ];

  const [isOpen, setIsOpen] = React.useState(false);
  const [checkboxes, setCheckboxes] = React.useState(
    // { [name]: false }
    Object.fromEntries(OTHER_OPTIONS.map(({ name }) => [name, false]))
  );
  const [text, setText] = React.useState("");

  const classes = useStyles();

  return (
    <>
      <p style={{ textAlign: "right", cursor: "pointer" }}>
        <a style={{ color: "#000A" }} onClick={() => setIsOpen((x) => !x)}>
          Tell us other ways you'd like to pay in the future
        </a>
      </p>
      <Drawer
        variant="persistent"
        anchor="right"
        open={isOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div>
          <IconButton onClick={() => setIsOpen(false)} aria-label="Close Panel">
            <CloseIcon />
          </IconButton>
          <p>
            What other types of payment would you like this service to accept in
            the future:
          </p>
          <FormGroup row>
            {OTHER_OPTIONS.map((p, i) => (
              <FormControlLabel
                key={i}
                control={<Checkbox name={p.name} />}
                label={p.label}
                onChange={(event: React.ChangeEvent<{}>) => {
                  if (event.target) {
                    setCheckboxes((acc) => ({
                      ...acc,
                      [p.name]: (event.target as any).checked,
                    }));
                  }
                }}
              />
            ))}
          </FormGroup>
          <p>Why would you prefer to use this form of payment?</p>

          <Input
            bordered
            multiline={true}
            rows={3}
            style={{ width: "100%" }}
            onChange={(ev) => {
              setText(ev.target.value);
            }}
            value={text}
          />

          <p style={{ textAlign: "right" }}>
            <ButtonBase onClick={() => setIsOpen(false)}>Save</ButtonBase>
          </p>
        </div>
      </Drawer>
    </>
  );
}
