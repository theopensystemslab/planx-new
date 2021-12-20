import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { visuallyHidden } from "@material-ui/utils";
import React, { ReactNode } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "block",
    width: "100%",
    "& > :not(:first-child)": {
      width: "100%",
    },
  },
  labelText: {
    paddingBottom: theme.spacing(1),
  },
}));

export default function InputLabel(props: {
  label: string;
  children: ReactNode;
  hidden?: boolean;
  describedBy?: string;
  htmlFor?: string;
}) {
  const classes = useStyles();
  return (
    <label
      className={classes.root}
      aria-describedby={props.describedBy}
      htmlFor={props.htmlFor}
    >
      <Typography
        className={classes.labelText}
        variant="body1"
        style={props.hidden ? visuallyHidden : undefined}
      >
        {props.label}
      </Typography>
      {props.children}
    </label>
  );
}
