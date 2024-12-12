import {
  AutocompleteChangeReason,
  AutocompleteProps,
  createFilterOptions
} from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import { FilterOptionsState } from "@mui/material/useAutocomplete";
import isNull from "lodash/isNull";
import React, { useMemo } from "react";
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
    <ListItem key={option} sx={{ fontFamily: (theme) => theme.typography.data.fontFamily }} {...props}>
      {option}
    </ListItem>
  );
};

const filter = createFilterOptions<string>();

export const DataFieldAutocomplete: React.FC<Props> = (props) => {
  const { value: initialValue, schema: options = [] } = props;

  const value: string | undefined = useMemo(
    () => options?.find((option) => option === initialValue),
    [initialValue, options],
  );

  const handleChange = (
    _event: React.SyntheticEvent,
    value: string | FilterOptionsState<string> | null,
    _reason: AutocompleteChangeReason,
  ) => {
    if (typeof value === "string") {
      // Selecting an option
      props.onChange(value);
    } else if (value && value.inputValue) {
      // Adding a new option
      props.onChange(value.inputValue);
    } else if (isNull(value)) {
      // Clearing an option
      props.onChange(value);
    }
  };

  return (
    <InputRow>
      <AutocompleteInput
        id="data-field-autocomplete"
        key="data-field-autocomplete"
        placeholder="Data field"
        required={Boolean(props.required)}
        onChange={handleChange}
        value={value}
        options={options}
        isOptionEqualToValue={(option: string, value: string) =>
          option === value
        }
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
        // getOptionLabel={(option) => {
        //   // Value selected with enter, right from the input
        //   if (typeof option === 'string') {
        //     return option;
        //   }
        //   // Add "xxx" option created dynamically
        //   if (option.inputValue) {
        //     return option.inputValue;
        //   }
        //   // Regular option
        //   return option;
        // }}
        renderOption={renderOptions}
        selectOnFocus
        clearOnEscape
        handleHomeEndKeys
      />
    </InputRow>
  );
};
