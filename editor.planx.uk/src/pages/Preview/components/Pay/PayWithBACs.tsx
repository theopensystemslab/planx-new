export default Component;

import { makeStyles } from "@material-ui/core";
import React from "react";

import Button from "./Button";

const useStyles = makeStyles({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
      margin: 0,
      padding: 0,
    },
  },
  h1: {
    fontSize: "25px",
    fontWeight: 700,
    lineHeight: "30px",
    marginBottom: "30px",
  },
  cancel: {
    fontSize: "15px",
    color: "#0008",
  },
});

function Component(props) {
  const c = useStyles();
  return (
    <div className={c.root}>
      <h1 className={c.h1}>Pay with BACs</h1>
      <p style={{ margin: "24px 0" }}>
        <Button onClick={props.goToSummary}>Continue</Button>
      </p>
      <p>
        <a href="#" className={c.cancel} onClick={props.goBack}>
          Cancel payment
        </a>
      </p>
    </div>
  );
}
