import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { visuallyHidden } from "@mui/utils";
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
  htmlFor?: string;
}) {
  const classes = useStyles();
  return (
    <label className={classes.root} htmlFor={props.htmlFor}>
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
