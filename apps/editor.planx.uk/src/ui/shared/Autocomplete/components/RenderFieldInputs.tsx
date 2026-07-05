import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import React from "react";

import { StyledDataField, StyledTextField } from "../styles";

interface RenderFieldInput {
  params: AutocompleteRenderInputParams;
  label?: string;
  required: boolean;
  placeholder?: string;
  ariaLabel?: string;
}

export const RenderDataFieldInput = ({
  params,
  label,
  required,
  placeholder,
  ariaLabel,
}: RenderFieldInput) => {
  return (
    <StyledDataField
      {...params}
      slotProps={{
        ...params.slotProps,
        input: { ...params.slotProps.input, notched: false },
        htmlInput: {
          ...params.slotProps?.htmlInput,
          ...(ariaLabel && { "aria-label": ariaLabel }),
        },
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
      slotProps={{
        ...params.slotProps,
        input: { ...params.slotProps.input, notched: false },
      }}
      label={label}
      placeholder={placeholder}
      required={required}
    />
  );
};
