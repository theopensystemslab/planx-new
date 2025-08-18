import { AutocompleteProps } from "@mui/material/Autocomplete";

export interface NestedFlow {
  id: string;
  slug: string;
  name: string;
  team: string;
}

export type FlowAutocompleteListProps = AutocompleteProps<
  NestedFlow,
  false,
  false,
  true,
  "div"
>;
