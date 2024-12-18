import Autocomplete, {
  autocompleteClasses,
  AutocompleteProps,
} from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import { inputLabelClasses } from "@mui/material/InputLabel";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import React from "react";
import { borderedFocusStyle } from "theme";

type RequiredAutocompleteProps<T> = Pick<
  AutocompleteProps<T, false, false, true, "div">,
  "options" | "onChange"
>;

type OptionalAutocompleteProps<T> = Partial<
  AutocompleteProps<T, false, false, true, "div">
>;

type WithLabel<T> = {
  label: string;
  placeholder?: never;
  required: boolean;
} & RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T>;

type WithPlaceholder<T> = {
  label?: never;
  placeholder: string;
  required: boolean;
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
    // TODO extract as `format="data"` prop more like `Input` ? 
    backgroundColor: "#f0f0f0",
    fontFamily: theme.typography.data.fontFamily,
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
      <StyledAutocomplete<T, false, false, true, "div">
        role="status"
        aria-atomic={true}
        aria-live="polite"
        forcePopupIcon={false}
        renderInput={(params) => (
          <StyledTextField
            {...params}
            InputProps={{
              ...params.InputProps,
              notched: false,
            }}
            label={props.label}
            placeholder={placeholder}
            required={props.required}
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
