import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { ChangeEvent } from "react";

import ErrorWrapper from "./ErrorWrapper";
import Input from "./Input";

export interface Props {
  label?: string;
  value?: string;
  error?: string;
  bordered?: boolean;
  onChange: (newDate: string) => void;
}

const useClasses = makeStyles((theme) => ({
  root: {},
  editor: {
    display: "flex",
    alignItems: "center",
    // Adds a uniform horizontal spacing between all child elements.
    // The `* + *` selector makes sure the first element doesn't get this margin.
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
  },
  label: {
    minWidth: 60,
    alignSelf: "end",
    marginBottom: theme.spacing(1.5),
  },
}));

export default function DateInput(props: Props): FCReturn {
  const [year, month, day] = (props.value || "").split("-");
  const classes = useClasses();

  return (
    <ErrorWrapper error={props.error}>
      <div className={classes.root}>
        <div className={classes.editor}>
          {props.label && (
            <Typography className={classes.label} variant="body1">
              {props.label}:
            </Typography>
          )}
          <Box>
            <Typography variant="body1">
              <label htmlFor="day">Day</label>
            </Typography>
            <Input
              style={{ width: 60 }}
              value={day || ""}
              placeholder="DD"
              bordered={props.bordered}
              id="day"
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", month || "", ev.target.value].join("-")
                );
              }}
            />
          </Box>
          <Box>
            <Typography variant="body1">
              <label htmlFor="month">Month</label>
            </Typography>
            <Input
              style={{ width: 60 }}
              value={month || ""}
              placeholder="MM"
              bordered={props.bordered}
              id="month"
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", ev.target.value, day || ""].join("-")
                );
              }}
            />
          </Box>
          <Box>
            <Typography variant="body1">
              <label htmlFor="year">Year</label>
            </Typography>
            <Input
              style={{ width: 90 }}
              value={year || ""}
              placeholder="YYYY"
              bordered={props.bordered}
              id="year"
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [ev.target.value, month || "", day || ""].join("-")
                );
              }}
            />
          </Box>
        </div>
      </div>
    </ErrorWrapper>
  );
}
