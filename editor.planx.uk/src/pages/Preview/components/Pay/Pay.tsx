import { makeStyles } from "@material-ui/core";
import React, { Suspense } from "react";

import { MoreInformation } from "../../../FlowEditor/data/types";
import Question from "../Question";
import Card from "../shared/Card";

export default Component;

const useStyles = makeStyles({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
    },
  },
});

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
  bacs: {
    label: "BACs",
    letter: "C",
    component: React.lazy(() => import("./PayWithBACs")),
  },
};

const Summary = React.lazy(() => import("./Summary"));

interface Props extends MoreInformation {
  handleSubmit: (any) => any;
}

function Component(props: Props) {
  const [state, setState] = React.useState("init");
  const Route = OPTIONS[state]?.component;
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
        />
      </Suspense>
    );
  }
  return (
    <Card>
      <Init setState={setState} />
    </Card>
  );
}

function Init(props) {
  const c = useStyles();
  return (
    <div className={c.root}>
      <Question
        text="How would you like to pay?"
        responses={Object.entries(OPTIONS).map(([key, value]) => ({
          id: key,
          responseKey: value.letter,
          title: value.label,
        }))}
        handleClick={(option) => {
          props.setState(option);
        }}
      />
      <p style={{ textAlign: "right", color: "#000A" }}>
        Tell us other ways you'd like to pay
      </p>
    </div>
  );
}
