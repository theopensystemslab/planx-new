import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(() => ({
  link: {
    position: "fixed",
    top: 0,
    zIndex: 10000, // there's a silly z-index in material somewhere
    background: "rgba(255,255,255,0.5)",
    color: "black",
    left: "50%",
    transform: "translate(-50%, 0)",
    padding: 10,
    display: "block",
  },
}));

export default function GitHelper(): FCReturn {
  const { link } = useStyles();

  if (
    !process.env.REACT_APP_GIT_BRANCH ||
    process.env.REACT_APP_GIT_BRANCH === "main"
  ) {
    return null;
  }

  if (process.env.REACT_APP_PULL_REQUEST) {
    return (
      <a className={link} href={process.env.REACT_APP_PULL_REQUEST}>
        {process.env.REACT_APP_GIT_BRANCH}
      </a>
    );
  } else {
    return (
      <div className={link} style={{ pointerEvents: "none" }}>
        {process.env.REACT_APP_GIT_BRANCH}
      </div>
    );
  }
}
