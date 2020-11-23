import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { ChangeEvent } from "react";

import Input from "./Input";

interface Props {
  label?: string;
  value?: string;
  bordered?: boolean;
  onChange: (newDate: string) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    "& > * + *": {
      marginLeft: theme.spacing(1),
    },
  },
  label: {
    minWidth: 60,
  },
}));

const DateInput: React.FC<Props> = (props) => {
  const [year, month, day] = (props.value || "").split("-");
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Typography className={classes.label} variant="body1">
        {props.label || "Date"}:
      </Typography>
      <Input
        style={{ width: 60 }}
        value={day || ""}
        placeholder="DD"
        bordered={props.bordered}
        onInput={(ev: ChangeEvent<HTMLInputElement>) => {
          props.onChange([year || "", month || "", ev.target.value].join("-"));
        }}
      />
      <Input
        style={{ width: 60 }}
        value={month || ""}
        placeholder="MM"
        bordered={props.bordered}
        onInput={(ev: ChangeEvent<HTMLInputElement>) => {
          props.onChange([year || "", ev.target.value, day || ""].join("-"));
        }}
      />
      <Input
        style={{ width: 90 }}
        value={year || ""}
        placeholder="YYYY"
        bordered={props.bordered}
        onInput={(ev: ChangeEvent<HTMLInputElement>) => {
          props.onChange([ev.target.value, month || "", day || ""].join("-"));
        }}
      />
    </Box>
  );
};

export default DateInput;
