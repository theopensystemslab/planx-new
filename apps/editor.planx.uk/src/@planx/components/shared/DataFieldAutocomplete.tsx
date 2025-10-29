import {
  AutocompleteProps,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import AutocompleteInput from "ui/shared/Autocomplete/AutocompleteInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import InputRow from "ui/shared/InputRow";

interface Props {
  schema?: string[];
  value?: string;
  onChange: (value: string | null) => void;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  allowCustomValues?: boolean;
  "data-testid"?: string;
  placeholder?: string;
}

const renderOptions: AutocompleteProps<
  string,
  false,
  false,
  boolean,
  "div"
>["renderOption"] = (props, option) => {
  return (
    <ListItem
      {...props}
      sx={{ fontFamily: (theme) => theme.typography.data.fontFamily }}
      key={option}
    >
      {option}
    </ListItem>
  );
};

const filter = createFilterOptions<string>();

export const DataFieldAutocomplete: React.FC<Props> = (props) => {
  const defaultSchema = useStore().getFlowSchema()?.nodes || [];
  const {
    value,
    schema: options = defaultSchema,
    allowCustomValues = true,
    placeholder = "Data field",
  } = props;

  const handleChange = (_event: React.SyntheticEvent, value: string | null) => {
    // Adding a new option via the "Add" button
    if (
      allowCustomValues &&
      typeof value === "string" &&
      value.startsWith('Add "')
    ) {
      const optionValue = value.split('"')[1];
      props.onChange(optionValue);
      return;
    }

    // Selecting or clearing an option
    props.onChange(value);
  };

  return (
    <InputRow>
      <ErrorWrapper error={props.errorMessage}>
        <AutocompleteInput
          sx={{ background: "#f0f0f0" }}
          id="data-field-autocomplete"
          key="data-field-autocomplete"
          data-testid={props["data-testid"]}
          placeholder={placeholder}
          required={Boolean(props.required)}
          onChange={handleChange}
          autoSelect
          value={value}
          options={options}
          disabled={props.disabled}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
            const { inputValue } = params;
            // Suggest the creation of a new value
            const isExisting = options.some((option) => inputValue === option);
            if (allowCustomValues && inputValue !== "" && !isExisting) {
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
          useDataFieldInput={true}
          freeSolo={allowCustomValues}
          selectOnFocus
          clearOnEscape
          handleHomeEndKeys
          autoHighlight
        />
      </ErrorWrapper>
    </InputRow>
  );
};
