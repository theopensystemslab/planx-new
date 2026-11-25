import type { AutocompleteProps } from "@mui/material/Autocomplete";
import Autocomplete from "@mui/material/Autocomplete";
import FormControl from "@mui/material/FormControl";
import { inputLabelClasses } from "@mui/material/InputLabel";
import { styled, type Theme } from "@mui/material/styles";

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
      color: theme.palette.text.primary,
    },
  },
})) as typeof Autocomplete;

const SelectMultipleTextField = styled(StyledTextField)(({ theme }) => ({
  [`&& .${inputLabelClasses.root}[data-shrink]`]: {
    ...theme.typography.body2,
    transform: "translateY(calc(-100% - 5px))",
    maxWidth: "100%",
  },
}));

// Height of a single line of body2 text plus the 5px gap
const labelSpacing = (theme: Theme) => ({
  mt: `calc(${theme.typography.body2.fontSize} * ${theme.typography.body2.lineHeight ?? 1.5} + 5px)`,
});

export function SelectMultiple<T>(props: Props<T>) {
  // MUI doesn't pass the Autocomplete value along to the TextField automatically
  const isSelectEmpty = !props.value?.length;
  const placeholder = isSelectEmpty ? props.placeholder : undefined;
  const value = props.value || [];

  return (
    <FormControl sx={{ display: "flex", flexDirection: "column" }}>
      <StyledAutocomplete<T, true, true, false, "div">
        sx={props.label ? labelSpacing : undefined}
        disableClearable
        disableCloseOnSelect
        multiple
        disabled={props.disabled}
        popupIcon={PopupIcon}
        renderInput={(params) => (
          <SelectMultipleTextField
            {...params}
            slotProps={{
              ...params.slotProps,
              input: { ...params.slotProps.input, notched: false },
              inputLabel: { ...params.slotProps.inputLabel, shrink: true },
            }}
            label={props.label}
            placeholder={placeholder}
            disabled={props.disabled}
          />
        )}
        slotProps={{
          chip: {
            variant: "uploadedFileTag",
            size: "small",
            sx: { pointerEvents: "none" },
            onDelete: undefined,
          },
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
        value={value}
      />
    </FormControl>
  );
}
