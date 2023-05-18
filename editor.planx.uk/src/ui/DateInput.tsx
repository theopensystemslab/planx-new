import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ChangeEvent, FocusEvent } from "react";

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

const Editor = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  // Adds a uniform horizontal spacing between all child elements.
  // The `* + *` selector makes sure the first element doesn't get this margin.
  "& > * + *": {
    marginLeft: theme.spacing(2),
  },
}));

const EditorLabel = styled(Typography)(({ theme }) => ({
  minWidth: 60,
  alignSelf: "end",
  marginBottom: theme.spacing(1.5),
}));

const Label = styled(Typography)(({ theme }) => ({
  paddingBottom: theme.spacing(0.5),
}));

export default function DateInput(props: Props): FCReturn {
  const [year, month, day] = (props.value || "").split("-");

  return (
    <ErrorWrapper error={props.error} id={props.id}>
      <Box>
        <Editor>
          {props.label && (
            <EditorLabel variant="body1">{props.label}:</EditorLabel>
          )}
          <Box sx={{ width: "60px" }}>
            <Label variant="body1">
              <label htmlFor="day">Day</label>
            </Label>
            <Input
              value={day || ""}
              inputProps={{ maxLength: "2" }}
              placeholder="DD"
              bordered={props.bordered}
              id={`${props.id}-day`}
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", month || "", ev.target.value].join("-"),
                  ev.type
                );
              }}
              onBlur={(ev: FocusEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", month || "", ev.target.value].join("-"),
                  ev.type
                );
              }}
            />
          </Box>
          <Box sx={{ width: "60px" }}>
            <Label variant="body1">
              <label htmlFor="month">Month</label>
            </Label>
            <Input
              value={month || ""}
              placeholder="MM"
              inputProps={{ maxLength: "2" }}
              bordered={props.bordered}
              id={`${props.id}-month`}
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", ev.target.value, day || ""].join("-"),
                  ev.type
                );
              }}
              onBlur={(ev: FocusEvent<HTMLInputElement>) => {
                props.onChange(
                  [year || "", ev.target.value, day || ""].join("-"),
                  ev.type
                );
              }}
            />
          </Box>
          <Box sx={{ width: "90px" }}>
            <Label variant="body1">
              <label htmlFor="year">Year</label>
            </Label>
            <Input
              value={year || ""}
              placeholder="YYYY"
              inputProps={{ maxLength: "4" }}
              bordered={props.bordered}
              id={`${props.id}-year`}
              onInput={(ev: ChangeEvent<HTMLInputElement>) => {
                props.onChange(
                  [ev.target.value, month || "", day || ""].join("-"),
                  ev.type
                );
              }}
            />
          </Box>
        </Editor>
      </Box>
    </ErrorWrapper>
  );
}
