import MenuItem from "@mui/material/MenuItem";
import type { QuestionField } from "@planx/components/shared/Schema/model";
import React from "react";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const SelectFieldInput: React.FC<Props<QuestionField>> = (props) => {
  const { data, formik } = props;
  const { id, errorMessage, name, value } = getFieldProps(props);

  return (
    <InputLabel label={data.title} id={`select-label-${id}`}>
      {data.description && (
        <FieldInputDescription description={data.description} />
      )}
      <ErrorWrapper id={`${id}-error`} error={errorMessage}>
        <SelectInput
          bordered
          required
          title={data.title}
          labelId={`select-label-${id}`}
          value={value}
          onChange={formik.handleChange}
          name={name}
        >
          {data.options.map((option) => (
            <MenuItem
              key={option.id}
              value={option.data.val || option.data.text}
            >
              {option.data.text}
            </MenuItem>
          ))}
        </SelectInput>
      </ErrorWrapper>
    </InputLabel>
  );
};
