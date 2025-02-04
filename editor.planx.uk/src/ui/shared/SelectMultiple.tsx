import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Autocomplete, {
  autocompleteClasses,
  AutocompleteProps,
} from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import { styled } from "@mui/material/styles";
import React from "react";

import { StyledTextField } from "./Autocomplete/styles";

const PopupIcon = (
  <ArrowIcon
    sx={(theme) => ({ color: theme.palette.primary.main })}
    fontSize="large"
  />
);

type RequiredAutocompleteProps<T> = Pick<
  AutocompleteProps<T, true, true, false, "div">,
  "options" | "onChange"
>;

type OptionalAutocompleteProps<T> = Partial<
  Omit<AutocompleteProps<T, true, true, false, "div">, "multiple">
>;

type WithLabel<T> = {
  label: string;
  placeholder?: never;
} & RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T>;

type WithPlaceholder<T> = {
  label?: never;
  placeholder: string;
} & RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T>;

type Props<T> = WithLabel<T> | WithPlaceholder<T>;

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& > div > label": {
    paddingRight: theme.spacing(3),
  },
  [`& .${autocompleteClasses.endAdornment}`]: {
    top: "unset",
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
        role="status"
        aria-atomic={true}
        aria-live="polite"
        disableClearable
        disableCloseOnSelect
        multiple
        popupIcon={PopupIcon}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            InputProps={{
              ...params.InputProps,
              notched: false,
            }}
            label={props.label}
            placeholder={placeholder}
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
