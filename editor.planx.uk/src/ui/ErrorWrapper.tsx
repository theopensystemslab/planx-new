import { makeStyles } from "@material-ui/core/styles";
import React, { ReactElement } from "react";

export interface Props {
  error?: string;
  children?: ReactElement;
}

const useClasses = makeStyles((theme) => ({
  rootError: {
    paddingLeft: theme.spacing(2),
    borderLeft: `3px solid ${theme.palette.error.main}`,
  },
  errorText: {
    color: theme.palette.error.main,
    margin: 0,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(0.5),
    fontWeight: "bold",
  },
}));

export default function DateInput(props: Props): FCReturn {
  const classes = useClasses();
  if (!props.error) {
    return props.children || null;
  }
  return (
    <div className={classes.rootError}>
      {props.children || null}
      <p className={classes.errorText}>{props.error}</p>
    </div>
  );
}
