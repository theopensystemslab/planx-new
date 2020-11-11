import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";

import Button from "./Button";

export default Component;

const useStyles = makeStyles({
  root: {
    "& *": {
      fontFamily: "Inter, sans-serif",
      boxSizing: "border-box",
      margin: 0,
      padding: 0,
    },
  },
  topBanner: {
    background: "#F0F9FA",
    marginBottom: "30px",
    padding: "13px",
    "& p": {
      margin: "20px 0",
    },
  },
  h1: {
    fontSize: "25px",
    fontWeight: 700,
    lineHeight: "30px",
    marginBottom: "30px",
  },
  h2: {
    margin: "14px 0",
  },
  table: {
    display: "grid",
    "& *": {
      overflow: "hidden",
    },
    gridTemplateColumns: "220px 1fr",
    borderBottom: "1px solid #D6D6D6",
    "& div": {
      borderTop: "1px solid #D6D6D6",
      lineHeight: "25px",
      alignItems: "center",
      padding: "10px 0",
    },
    "& :nth-child(2n+1)": {
      fontSize: "20px",
      color: "#000B",
    },
    "& :nth-child(2n+2)": {
      fontSize: "21px",
      color: "#000B",
      fontWeight: 700,
    },
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
      <div className={c.topBanner}>
        <h2>Payment summary</h2>
        <p>
          Householder planning application
          <br />
          Total amount due:
        </p>
        <h2>£206</h2>
      </div>
      <h1 className={c.h1}>Confirm your payment</h1>
      <div className={c.table}>
        <div>Card number:</div>
        <div>
          <span
            style={{
              // XXX: Fix for asterisks getting out of alignment 🤷
              fontFamily: "monospace",
            }}
          >
            ************
          </span>
          6511
        </div>
        <div>Expiry date:</div>
        <div>10/20</div>
        <div>Name on card:</div>
        <div>Aisha Appleton</div>
        <div>Billing address:</div>
        <div>24 Right Way, London, SE1 2EZ, United Kingdom</div>
        <div>Confirmation email:</div>
        <div>aisha.a@test.com</div>
      </div>
      <p style={{ margin: "24px 0" }}>
        <Button onClick={() => window.alert("This feature is coming soon")}>
          Pay & submit
        </Button>
      </p>
      <p>
        <a href="#" className={c.cancel} onClick={props.goBack}>
          Cancel payment
        </a>
      </p>
    </div>
  );
}
