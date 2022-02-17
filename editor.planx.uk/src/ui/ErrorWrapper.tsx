import { makeStyles } from "@material-ui/core/styles";
import React, { ReactElement } from "react";

export interface Props {
  error: string | string[] | undefined;
  children?: ReactElement;
}

const useClasses = makeStyles((theme) => ({
  rootError: {
    width: "100%",
    paddingLeft: theme.spacing(2),
    borderLeft: `3px solid ${theme.palette.error.main}`,
  },
  errorText: {
    color: theme.palette.error.main,
    margin: 0,
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(1),
    fontWeight: "bold",
  },
}));

export default function ErrorWrapper(props: Props): FCReturn {
  const classes = useClasses();
  return (
    <div
      id="error-wrapper"
      className={props.error ? classes.rootError : undefined}
      role="status"
    >
      {props.error && (
        <p id="error-message" className={classes.errorText}>
          {props.error}
        </p>
      )}
      {props.children || null}
    </div>
  );
}
