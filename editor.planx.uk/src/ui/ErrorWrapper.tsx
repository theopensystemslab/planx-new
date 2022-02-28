import { makeStyles } from "@material-ui/core/styles";
import { ERROR_MESSAGE } from "@planx/components/shared/constants";
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
    // role="status" immediately announces the error to screenreaders without interrupting focus
    <div
      className={props.error ? classes.rootError : undefined}
      role={props.error ? "status" : undefined}
    >
      {props.error && (
        <p id={ERROR_MESSAGE} className={classes.errorText}>
          {props.error}
        </p>
      )}
      {props.children || null}
    </div>
  );
}
