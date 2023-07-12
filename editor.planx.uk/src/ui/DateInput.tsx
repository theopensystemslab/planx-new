import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import React, { ChangeEvent, FocusEvent } from "react";

import type { Theme } from "../theme";
import ErrorWrapper from "./ErrorWrapper";
import Input from "./Input";

export interface Props {
  label?: string;
  value?: string;
  error?: string;
  bordered?: boolean;
  id?: string;
  onChange: (newDate: string, eventType: string) => void;
}

const INPUT_DATE_WIDTH = "65px";
const INPUT_YEAR_WIDTH = "80px";

const useClasses = makeStyles((theme: Theme) => ({
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
  editorLabel: {
    minWidth: INPUT_DATE_WIDTH,
    alignSelf: "end",
    marginBottom: theme.spacing(1.5),
  },
  label: {
    paddingBottom: theme.spacing(0.5),
  },
  dayContainer: {
    width: INPUT_DATE_WIDTH,
  },
  monthContainer: {
    width: INPUT_DATE_WIDTH,
  },
  yearContainer: {
    width: INPUT_YEAR_WIDTH,
  },
}));

export default function DateInput(props: Props): FCReturn {
  const [year, month, day] = (props.value || "").split("-");
  const classes = useClasses();

  return (
    <ErrorWrapper error={props.error} id={props.id}>
      <div className={classes.root}>
        <div className={classes.editor}>
          {props.label && (
            <Typography className={classes.editorLabel} variant="body1">
              {props.label}:
            </Typography>
          )}
          <Box className={classes.dayContainer}>
            <Typography variant="body1" className={classes.label}>
              <label htmlFor="day">Day</label>
            </Typography>
            <Input
              value={day || ""}
              inputProps={{ maxLength: "2" }}
              placeholder="DD"
              bordered={props.bordered}
              id={`${props.id}-day`}
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", month || "", ev.target.value].join("-"),
                  ev.type,
                );
              }}
              onBlur={(ev: FocusEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", month || "", ev.target.value].join("-"),
                  ev.type,
                );
              }}
            />
          </Box>
          <Box className={classes.monthContainer}>
            <Typography variant="body1" className={classes.label}>
              <label htmlFor="month">Month</label>
            </Typography>
            <Input
              value={month || ""}
              placeholder="MM"
              inputProps={{ maxLength: "2" }}
              bordered={props.bordered}
              id={`${props.id}-month`}
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", ev.target.value, day || ""].join("-"),
                  ev.type,
                );
              }}
              onBlur={(ev: FocusEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", ev.target.value, day || ""].join("-"),
                  ev.type,
                );
              }}
            />
          </Box>
          <Box className={classes.yearContainer}>
            <Typography variant="body1" className={classes.label}>
              <label htmlFor="year">Year</label>
            </Typography>
            <Input
              value={year || ""}
              placeholder="YYYY"
              inputProps={{ maxLength: "4" }}
              bordered={props.bordered}
              id={`${props.id}-year`}
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [ev.target.value, month || "", day || ""].join("-"),
                  ev.type,
                );
              }}
            />
          </Box>
        </div>
      </div>
    </ErrorWrapper>
  );
}
