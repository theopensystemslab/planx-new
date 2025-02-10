import { AutocompleteProps } from "@mui/material/Autocomplete";

type RequiredAutocompleteProps<T> = Pick<
  AutocompleteProps<T, false, false, true, "div">,
  "options" | "onChange"
>;

type OptionalAutocompleteProps<T> = Partial<
  AutocompleteProps<T, false, false, true, "div">
> & { useDataFieldInput?: boolean };

export type WithLabel<T> = {
  label: string;
  placeholder?: never;
  required: boolean;
} & RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T>;

export type WithPlaceholder<T> = {
  label?: never;
  placeholder: string;
  required: boolean;
} & RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T>;
