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
import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";
import { handleSubmit } from "pages/Preview/Node";
import React, { Suspense, useEffect } from "react";
import { useAsync } from "react-use";
import Input from "ui/Input";

import type { Pay } from "../model";

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

const OPTIONS: Record<
  string,
  { label: string; letter: string; component?: React.FC<any> }
> = {
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
  govUk: {
    label: "GOV.UK Pay",
    letter: "C",
  },
};

const GovUkTemporaryComponent = (props: {
  url: string;
  amount: number;
  flowId: string;
}) => {
  const [passport, mutatePassport] = useStore((state) => [
    state.passport,
    state.mutatePassport,
  ]);
  const [govUrl, setGovUrl] = React.useState<string>();

  const params = {
    amount: props.amount,
    // TODO: Might make more sense to use sessionId, applicationId, or some other PlanX identifier instead
    reference: props.flowId,
    description: "New application",
    return_url: window.location.href,
  };

  const request = useAsync(async () => axios.post(props.url, params));

  useEffect(() => {
    if (!request.loading && !request.error && request.value) {
      setGovUrl(request.value.data._links.next_url.href);
      mutatePassport((draft) => {
        draft.data["paymentReference"] = request.value.data.payment_id;
      });
    }
  }, [request.loading, request.error, request.value]);

  if (request.loading) {
    return <Card>Loading...</Card>;
  } else if (request.error) {
    throw request.error;
  } else {
    return (
      <Card>
        <a href={govUrl}>Click here to pay</a>
      </Card>
    );
  }
};

const Summary = React.lazy(() => import("./Summary"));
const Paid = React.lazy(() => import("./Paid"));

interface Props extends Pay {
  handleSubmit: handleSubmit;
}

function Component(props: Props) {
  const [passport, id] = useStore((state) => [state.passport, state.id]);
  const [state, setState] = React.useState<
    "init" | "summary" | "paid" | "govUk"
  >(passport.data.paymentReference ? "paid" : "init");
  const [otherPayments, setOtherPayments] = React.useState({});
  const Route = OPTIONS[state]?.component;

  // TODO: Error handling for case where fee somehow doesn't exist
  // TODO: More gracefully store/find this fee
  const fee = Number(passport.data["application.fee"].value[0]);

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
  // TODO: If this is the only way to pay at first, remove other options
  if (state === "govUk") {
    return (
      <GovUkTemporaryComponent
        url="http://localhost:7002/pay"
        amount={fee}
        flowId={id}
      />
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
          amount={fee}
        />
      </Suspense>
    );
  }
  if (state === "paid") {
    return (
      <Suspense fallback={<>Loading...</>}>
        <Paid handleSubmit={() => props.handleSubmit()} amount={fee} />
      </Suspense>
    );
  }
  return (
    <Card>
      <Init
        setState={setState}
        setOtherPayments={setOtherPayments}
        amount={fee}
        {...props}
      />
    </Card>
  );
}

// TODO: type the props
function Init(props: any) {
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
          {`£${props.amount}`}
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
