import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { ChangeEvent } from "react";

import Input from "./Input";

export interface Props {
  label?: string;
  value?: string;
  bordered?: boolean;
  onChange: (newDate: string) => void;
}

const useClasses = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    // Adds a uniform horizontal spacing between all child elements.
    // The `* + *` selector makes sure the first element doesn't get this margin.
    "& > * + *": {
      marginLeft: theme.spacing(1),
    },
  },
  label: {
    minWidth: 60,
  },
}));

export default function DateInput(props: Props): FCReturn {
  const [year, month, day] = (props.value || "").split("-");
  const classes = useClasses();
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
}
