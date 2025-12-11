import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import { styled } from "@mui/material/styles";
import React from "react";

import { StyledTextField } from "./Autocomplete/styles";
import { PopupIcon } from "./PopUpIcon";

export type RequiredAutocompleteProps<T> = Pick<
  AutocompleteProps<T, true, true, false, "div">,
  "options" | "onChange"
>;

export type OptionalAutocompleteProps<T> = Partial<
  Omit<AutocompleteProps<T, true, true, false, "div">, "multiple">
>;

type WithLabel<T> = {
  label: React.ReactNode;
  placeholder?: never;
} & RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T>;

type WithPlaceholder<T> = {
  label?: never;
  placeholder: string;
} & RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T>;

type Props<T> = WithLabel<T> | WithPlaceholder<T>;

export const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  "& button > svg": {
    padding: theme.spacing(0.5, 0),
    fontSize: "2.5rem",
  },
  "& > div > label": {
    paddingRight: theme.spacing(3),
  },
  "& button.Mui-disabled > svg": {
    color: theme.palette.text.disabled,
  },
  "& input": {
    backgroundColor: "transparent",
  },
  "&:focus-within": {
    "& svg": {
      color: "black",
    },
  },
})) as typeof Autocomplete;

export function SelectMultiple<T>(props: Props<T>) {
  // MUI doesn't pass the Autocomplete value along to the TextField automatically
  const isSelectEmpty = !props.value?.length;
  const placeholder = isSelectEmpty ? props.placeholder : undefined;

  return (
    <FormControl sx={{ display: "flex", flexDirection: "column" }}>
      <StyledAutocomplete<T, true, true, false, "div">
        sx={{ mt: props.label ? 2 : 0 }}
        disableClearable
        disableCloseOnSelect
        multiple
        disabled={props.disabled}
        popupIcon={PopupIcon}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            InputProps={{
              ...params.InputProps,
              notched: false,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            label={props.label}
            placeholder={placeholder}
            disabled={props.disabled}
          />
        )}
        ChipProps={{
          variant: "uploadedFileTag",
          size: "small",
          sx: { pointerEvents: "none" },
          onDelete: undefined,
        }}
        componentsProps={{
          popupIndicator: {
            disableRipple: true,
          },
          popper: {
            sx: {
              boxShadow: 10,
            },
          },
        }}
        {...props}
      />
    </FormControl>
  );
}
