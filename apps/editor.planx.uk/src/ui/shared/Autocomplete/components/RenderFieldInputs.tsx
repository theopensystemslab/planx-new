import { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import React from "react";

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
      }}
      label={label}
      placeholder={placeholder}
      required={required}
    />
  );
};
