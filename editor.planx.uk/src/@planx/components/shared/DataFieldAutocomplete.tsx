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
    // Adding a new option via the "Add" button
    if (typeof value === "string" && value.startsWith('Add "')) {
      const optionValue = value.split('"')[1];
      props.onChange(optionValue);
      return;
    }

    // Selecting or clearing an option
    props.onChange(value);
  };

  return (
    <InputRow>
      <AutocompleteInput
        id="data-field-autocomplete"
        key="data-field-autocomplete"
        placeholder="Data field"
        required={Boolean(props.required)}
        onChange={handleChange}
        autoSelect
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
      />
    </InputRow>
  );
};
