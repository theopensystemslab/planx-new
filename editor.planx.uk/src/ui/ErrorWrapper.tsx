import makeStyles from "@mui/styles/makeStyles";
import { ERROR_MESSAGE } from "@planx/components/shared/constants";
import React, { ReactElement } from "react";

export interface Props {
  error: string | string[] | undefined;
  children?: ReactElement;
  id?: string;
}

const useClasses = makeStyles((theme) => ({
  rootError: {
    width: "100%",
    paddingLeft: theme.spacing(2),
    borderLeft: `3px solid ${theme.palette.error.main}`,
    // Only apply padding to child when visible to ensure no blank space
    "& > p": {
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(1),
    },
  },
  errorText: {
    color: theme.palette.error.main,
    margin: 0,
    fontWeight: 600,
  },
}));

export default function ErrorWrapper(props: Props): FCReturn {
  const classes = useClasses();
  const id = props.id ? `${ERROR_MESSAGE}-${props.id}` : undefined;

  return (
    // role="status" immediately announces the error to screenreaders without interrupting focus
    <div
      className={props.error ? classes.rootError : undefined}
      role="status"
      data-testid="error-wrapper"
    >
      <p id={id} data-testid={id} className={classes.errorText}>
        {props?.error}
      </p>
      {props.children || null}
    </div>
  );
}
