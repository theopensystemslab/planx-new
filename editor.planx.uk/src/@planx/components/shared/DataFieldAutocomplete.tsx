import {
  AutocompleteProps,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import AutocompleteInput from "ui/shared/AutocompleteInput";
import InputRow from "ui/shared/InputRow";

interface Props {
  schema?: string[];
  value?: string;
  onChange: (value: string | null) => void;
  required?: boolean;
}

const renderOptions: AutocompleteProps<
  string,
  false,
  false,
  true,
  "div"
>["renderOption"] = (props, option) => {
  return (
    <ListItem
      key={option}
      sx={{ fontFamily: (theme) => theme.typography.data.fontFamily }}
      {...props}
    >
      {option}
    </ListItem>
  );
};

const filter = createFilterOptions<string>();

export const DataFieldAutocomplete: React.FC<Props> = (props) => {
  const defaultSchema = useStore().getFlowSchema()?.nodes || [];
  const { value, schema: options = defaultSchema } = props;

  const handleChange = (_event: React.SyntheticEvent, value: string | null) => {
    if (typeof value === "string" && value.startsWith('Add "')) {
      props.onChange(value.split('"')[1]);
    } else {
      props.onChange(value);
    }
  };

  return (
    <InputRow>
      <AutocompleteInput
        placeholder="Data field"
        required={Boolean(props.required)}
        onChange={handleChange}
        // Ensure user doesn't have to hit "enter" or "Add xxx" to trigger a change
        // TODO: Use blur or something like this?
        onInputChange={handleChange}
        value={value}
        options={options}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option);
          if (inputValue !== "" && !isExisting) {
            filtered.push(`Add "${inputValue}"`);
          }
          return filtered;
        }}
        getOptionLabel={(option) => {
          let formattedOption = option;
          // If a new option was added, strip out the value between ""
          if (option.startsWith('Add "')) {
            formattedOption = option.split('"')[1];
          }
          return formattedOption;
        }}
        renderOption={renderOptions}
        freeSolo
        selectOnFocus
        clearOnEscape
        handleHomeEndKeys
        autoHighlight
      />
    </InputRow>
  );
};
