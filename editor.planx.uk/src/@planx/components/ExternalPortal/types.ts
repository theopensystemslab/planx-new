import { AutocompleteProps } from "@mui/material/Autocomplete";

export interface Flow {
  id: string;
  slug: string;
  name: string;
  team: string;
}
export type FlowAutocompleteListProps = AutocompleteProps<
  Flow,
  false,
  false,
  true,
  "div"
>;
