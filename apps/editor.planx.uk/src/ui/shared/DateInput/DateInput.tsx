import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent, FocusEvent } from "react";

import ErrorWrapper from "../ErrorWrapper";
import Input from "../Input/Input";

export interface Props {
  label?: string;
  value?: string;
  error?: string;
  bordered?: boolean;
  id?: string;
  onChange: (newDate: string, eventType: string) => void;
  required?: boolean;
  disabled?: boolean;
}

const INPUT_DATE_WIDTH = "65px";
const INPUT_YEAR_WIDTH = "84px";

const Root = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-end",
  // Adds a uniform horizontal spacing between all child elements.
  // The `* + *` selector makes sure the first element doesn't get this margin.
  "& > * + *": {
    marginLeft: theme.spacing(2),
  },
}));

const Label = styled(Typography)(({ theme }) => ({
  minWidth: INPUT_DATE_WIDTH,
  alignSelf: "end",
  marginBottom: theme.spacing(1),
  display: "inline-block",
})) as typeof Typography;

export default function DateInput(props: Props): FCReturn {
  const [year, month, day] = (props.value || "").split("-");

  return (
    <ErrorWrapper error={props.error} id={props.id}>
      <Root>
        {props.label && (
          <Typography sx={{ mb: 1.5, minWidth: 65 }} variant="body1">
            {props.label}:
          </Typography>
        )}
        <Box sx={{ width: INPUT_DATE_WIDTH }}>
          <Label
            variant="body1"
            htmlFor={`${props.id}-day`}
            component={"label"}
          >
            Day
          </Label>
          <Input
            value={day || ""}
            inputProps={{ maxLength: "2" }}
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
            required={props.required}
            disabled={props.disabled}
          />
        </Box>
        <Box sx={{ width: INPUT_DATE_WIDTH }}>
          <Label
            variant="body1"
            htmlFor={`${props.id}-month`}
            component={"label"}
          >
            Month
          </Label>
          <Input
            value={month || ""}
            inputProps={{ maxLength: "9" }}
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
            required={props.required}
            disabled={props.disabled}
          />
        </Box>
        <Box sx={{ width: INPUT_YEAR_WIDTH }}>
          <Label
            variant="body1"
            htmlFor={`${props.id}-year`}
            component={"label"}
          >
            Year
          </Label>
          <Input
            value={year || ""}
            inputProps={{ maxLength: "4" }}
            bordered={props.bordered}
            id={`${props.id}-year`}
            onInput={(ev: ChangeEvent<HTMLInputElement>) => {
              props.onChange(
                [ev.target.value, month || "", day || ""].join("-"),
                ev.type,
              );
            }}
            required={props.required}
            disabled={props.disabled}
          />
        </Box>
      </Root>
    </ErrorWrapper>
  );
}
