import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Autocomplete, { autocompleteClasses, AutocompleteProps, createFilterOptions } from '@mui/material/Autocomplete';
import FormControl from "@mui/material/FormControl";
import { inputLabelClasses } from "@mui/material/InputLabel";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import React from "react";
import { borderedFocusStyle } from "theme";

const PopupIcon = (
  <ArrowIcon
    sx={(theme) => ({ color: theme.palette.primary.main })}
    fontSize="large"
  />
);

// T = value = string, multiple=false, disableClearable=true, freeSolo=true, chip="div"
type RequiredAutocompleteProps<T> = Pick<
  AutocompleteProps<T, false, true, true, "div">,
  "options" | "onChange"
>;

type WithLabel<T> = {
  label: string;
  placeholder?: never;
} & RequiredAutocompleteProps<T>;

type WithPlaceholder<T> = {
  label?: never;
  placeholder: string;
} & RequiredAutocompleteProps<T>;

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

const StyledTextField = styled(TextField)(({ theme }) => ({
  "&:focus-within": {
    ...borderedFocusStyle,
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      border: "1px solid transparent !important",
    },
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    borderRadius: 0,
    border: `1px solid${theme.palette.border.main} !important`,
  },
  "& fieldset": {
    borderColor: theme.palette.border.main,
  },
  backgroundColor: theme.palette.background.paper,
  [`& .${outlinedInputClasses.root}, input`]: {
    cursor: "pointer",
    backgroundColor: theme.palette.background.default,
  },
  [`& .${inputLabelClasses.root}`]: {
    textDecoration: "underline",
    color: theme.palette.primary.main,
    "&[data-shrink=true]": {
      textDecoration: "none",
      color: theme.palette.text.primary,
      paddingY: 0,
      transform: "translate(0px, -22px) scale(0.85)",
    },
  },
}));


export default function AutocompleteInput<T>(props: Props<T>) {
  const isSelectEmpty = !props.value;
  const placeholder = isSelectEmpty ? props.placeholder : undefined;

  return (
    <FormControl sx={{ display: "flex", flexDirection: "column" }}>
      <StyledAutocomplete<T, false, true, true, "div">
        sx={{ width: 300 }}
        role="status"
        aria-atomic={true}
        aria-live="polite"
        disableClearable
        freeSolo
        popupIcon={PopupIcon}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            InputProps={{
              ...params.InputProps,
              notched: false,
            }}
            label={props.label}
            placeholder={props.placeholder}
          />
        )}
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
