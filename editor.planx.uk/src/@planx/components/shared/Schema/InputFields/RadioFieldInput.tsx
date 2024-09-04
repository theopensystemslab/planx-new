import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import type { QuestionField } from "@planx/components/shared/Schema/model";
import React from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import BasicRadio from "../../Radio/BasicRadio";
import { getFieldProps, Props } from ".";

export const RadioFieldInput: React.FC<Props<QuestionField>> = (props) => {
  const { data, formik } = props;
  const { id, errorMessage, name, value } = getFieldProps(props);

  return (
    <FormControl sx={{ width: "100%" }} component="fieldset">
      <FormLabel
        component="legend"
        id={`radio-buttons-group-label-${id}`}
        sx={(theme) => ({
          color: theme.palette.text.primary,
          "&.Mui-focused": {
            color: theme.palette.text.primary,
          },
        })}
      >
        {data.title}
      </FormLabel>
      {data.description && (
        <Typography variant="body2" mb={1.5}>
          {data.description}
        </Typography>
      )}
      <ErrorWrapper id={`${id}-error`} error={errorMessage}>
        <RadioGroup
          aria-labelledby={`radio-buttons-group-label-${id}`}
          name={name}
          sx={{ p: 1, mb: -2 }}
          value={value}
        >
          {data.options.map(({ id, data }) => (
            <BasicRadio
              key={id}
              id={data.val || data.text}
              title={data.text}
              onChange={formik.handleChange}
            />
          ))}
        </RadioGroup>
      </ErrorWrapper>
    </FormControl>
  );
};
