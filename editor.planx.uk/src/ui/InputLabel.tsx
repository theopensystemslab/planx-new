import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
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
}) {
  const classes = useStyles();
  return (
    <label className={classes.root}>
      <Typography className={classes.labelText} variant="body1">
        {props.label}
      </Typography>
      {props.children}
    </label>
  );
}
