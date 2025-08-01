import { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import React, { FocusEvent } from "react";

import { StyledDataField, StyledTextField } from "../styles";

interface RenderFieldInput {
  params: AutocompleteRenderInputParams;
  label?: string;
  required: boolean;
  placeholder?: string;
}

export const RenderDataFieldInput = ({
  params,
  label,
  required,
  placeholder,
}: RenderFieldInput) => {
  return (
    <StyledDataField
      {...params}
      InputProps={{
        ...params.InputProps,
        onBlur: (e) =>
          setTimeout(() => {
            params.inputProps.onBlur?.(e as FocusEvent<HTMLInputElement>);
          }, 0),
        notched: false,
      }}
      label={label}
      placeholder={placeholder}
      required={required}
    />
  );
};

export const RenderTextFieldInput = ({
  params,
  label,
  required,
  placeholder,
}: RenderFieldInput) => {
  return (
    <StyledTextField
      {...params}
      InputProps={{
        ...params.InputProps,
        notched: false,
        onBlur: (e) =>
          setTimeout(() => {
            params.inputProps.onBlur?.(e as FocusEvent<HTMLInputElement>);
          }, 0),
      }}
      label={label}
      placeholder={placeholder}
      required={required}
    />
  );
};
