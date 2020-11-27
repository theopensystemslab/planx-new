import ButtonBase from "@material-ui/core/ButtonBase";
import Checkbox from "@material-ui/core/Checkbox";
import Drawer from "@material-ui/core/Drawer";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Question from "@planx/components/Question/Public";
import Card from "@planx/components/shared/Preview/Card";
import { handleSubmit } from "pages/Preview/Node";
import React, { Suspense } from "react";
import Input from "ui/Input";

import { Pay } from "../types";

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
    padding: 20,
    "& p": {
      textAlign: "left",
    },
    "& a": {
      color: theme.palette.primary.contrastText,
    },
    "& .marginBottom": {
      marginBottom: theme.spacing(4),
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

const OPTIONS = {
  card: {
    label: "Credit or debit card",
    letter: "A",
    component: React.lazy(() => import("./PayWithCard")),
  },
  apple: {
    label: "Apple Pay",
    letter: "B",
    component: React.lazy(() => import("./PayWithApple")),
  },
};

const Summary = React.lazy(() => import("./Summary"));
const Paid = React.lazy(() => import("./Paid"));

interface Props extends Pay {
  handleSubmit: handleSubmit;
}

function Component(props: Props) {
  const [state, setState] = React.useState<"init" | "summary" | "paid">("init");
  const [otherPayments, setOtherPayments] = React.useState({});
  const Route = OPTIONS[state]?.component;
  // TODO: When connecting this component to the flow and to the backend
  //       remember to also pass up the value of `otherPayments`
  //       to be stored in special data fields, e.g.
  //       - feedback.payment.type
  //       - feedback.pyment.reason
  if (Route) {
    return (
      <Card>
        <Suspense fallback={<>Loading...</>}>
          <Route
            goBack={() => {
              setState("init");
            }}
            goToSummary={() => {
              setState("summary");
            }}
          />
        </Suspense>
      </Card>
    );
  }
  if (state === "summary") {
    return (
      <Suspense fallback={<>Loading...</>}>
        <Summary
          goBack={() => {
            setState("init");
          }}
          submit={() => {
            setState("paid");
          }}
        />
      </Suspense>
    );
  }
  if (state === "paid") {
    return (
      <Suspense fallback={<>Loading...</>}>
        <Paid handleSubmit={() => props.handleSubmit()} />
      </Suspense>
    );
  }
  return (
    <Card>
      <Init
        setState={setState}
        setOtherPayments={setOtherPayments}
        {...props}
      />
    </Card>
  );
}

function Init(props) {
  const OTHER_OPTIONS = [
    { name: "BACs", label: "Bank transfer by BACs" },
    { name: "Cheque", label: "Cheque" },
    { name: "PayPal", label: "PayPal" },
    { name: "Phone", label: "Phone" },
    { name: "Other", label: "Other" },
  ];

  const classes = useStyles();

  // Regarding the sidebar
  const [isOpen, setIsOpen] = React.useState(false);
  const [checkboxes, setCheckboxes] = React.useState(
    // { [name]: false }
    Object.fromEntries(OTHER_OPTIONS.map(({ name }) => [name, false]))
  );
  const [text, setText] = React.useState("");

  return (
    <div className={classes.root}>
      <div className={classes.banner}>
        <Typography variant="subtitle1" gutterBottom className="marginBottom">
          The fee for this application is
        </Typography>
        <Typography variant="h1" gutterBottom className="marginBottom">
          £206
        </Typography>
        <Typography>
          <a href="#">How are the planning fees calculated? ↗︎</a>
        </Typography>
      </div>
      <Question
        text="How would you like to pay?"
        responses={Object.entries(OPTIONS).map(([key, value]) => ({
          id: key,
          responseKey: value.letter,
          title: value.label,
        }))}
        handleSubmit={(option) => {
          props.setOtherPayments({
            options: checkboxes,
            text,
          });
          props.setState(option);
        }}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
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
            What other types of payment would you lke this service to accept in
            the future:
          </p>
          <FormGroup row>
            {OTHER_OPTIONS.map((p, i) => (
              <FormControlLabel
                key={i}
                control={<Checkbox name={p.name} />}
                label={p.label}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (event.target) {
                    setCheckboxes((acc) => ({
                      ...acc,
                      [p.name]: event.target.checked,
                    }));
                  }
                }}
              />
            ))}
          </FormGroup>
          <p>Why would you prefer to use this form of payment?</p>

          <Input
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
    </div>
  );
}
