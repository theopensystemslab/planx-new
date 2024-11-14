import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
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

export const CustomCheckbox = styled("span")(({ theme }) => ({
  display: "inline-flex",
  flexShrink: 0,
  position: "relative",
  width: 40,
  height: 40,
  borderColor: theme.palette.text.primary,
  border: "2px solid",
  background: "transparent",
  marginRight: theme.spacing(1.5),
  "&.selected::after": {
    content: "''",
    position: "absolute",
    height: 24,
    width: 12,
    borderColor: theme.palette.text.primary,
    borderBottom: "5px solid",
    borderRight: "5px solid",
    left: "50%",
    top: "42%",
    transform: "translate(-50%, -50%) rotate(45deg)",
    cursor: "pointer",
  },
}));

export function SelectMultiple<T>(props: Props<T>) {
  // MUI doesn't pass the Autocomplete value along to the TextField automatically
  const isSelectEmpty = !props.value?.length;
  const placeholder = isSelectEmpty ? props.placeholder : undefined

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
