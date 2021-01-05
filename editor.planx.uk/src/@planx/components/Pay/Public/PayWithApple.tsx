import { makeStyles } from "@material-ui/core/styles";
import Card from "@planx/components/shared/Preview/Card";
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
  h1: {
    fontSize: "25px",
    fontWeight: 700,
    lineHeight: "30px",
    marginBottom: "30px",
  },
  pay: {
    width: "100%",
    background: "#000",
    color: "white",
    fontSize: "15px",
    height: "40px",
    verticalAlign: "middle",
    border: "none",
  },
  cancel: {
    fontSize: "15px",
    color: "#0008",
  },
});

function Component(props: any) {
  const c = useStyles();
  return (
    <Card>
      <div className={c.root}>
        <h1 className={c.h1}>Pay by Apple Pay</h1>
        <p>
          <button
            className={c.pay}
            onClick={() => window.alert("This feature is coming soon")}
          >
            Pay with <AppleLogo /> Pay
          </button>
        </p>
        <p style={{ margin: "24px 0" }}>
          <Button onClick={props.goToSummary}>Continue</Button>
        </p>
        <p>
          <a href="#" className={c.cancel} onClick={props.goBack}>
            Cancel payment
          </a>
        </p>
      </div>
    </Card>
  );
}

function AppleLogo() {
  return (
    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADOSURBVHgBnZMBDcIwEEWvBAGTMBzMATgZDsABOKAOigNAwTYF4KA46Bwcd9s1OZItcHvJT5tL/+/1sgH8ASJWpIZ0BytiTjjiwQqZoph5LS1eNpe/zE4dLmg5kPhgT+pILamS2lbWF+nhnGv1TbV6pybN1JkLe9fS2hWmKWAel28PaCfo9iPaqbJ/JYOxknRAD3Y2OuANdmod0IGdPc3hNOxos8Pl+BzS4DLKHMDffDKaz1+PosLRYH5OTkZConQTSDwsnpFnk9RvOP54Ax+Ox/V2VrhiUQAAAABJRU5ErkJggg==" />
  );
}
