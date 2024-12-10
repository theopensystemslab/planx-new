import {
  AutocompleteChangeReason,
  AutocompleteProps,
  createFilterOptions,
} from "@mui/material/Autocomplete";
import ListItem from "@mui/material/ListItem";
import React, { useMemo } from "react";
import AutocompleteInput from "ui/shared/AutocompleteInput";
import InputRow from "ui/shared/InputRow";

interface Props {
  schema?: string[];
  value?: string;
  onChange: (value: string) => void;
}

const filter = createFilterOptions<string>();

export const DataFieldAutocomplete: React.FC<Props> = (props) => {
  const { value: initialValue, schema: options = [] } = props;

  const value: string | undefined = useMemo(
    () => options?.find((option) => option === initialValue),
    [initialValue, options],
  );

  const handleChange = (
    _event: React.SyntheticEvent,
    value: string,
    _reason: AutocompleteChangeReason,
  ) => {
    props.onChange(value);
  };

  return (
    <InputRow>
      <AutocompleteInput
        id="data-field-autocomplete"
        key="data-field-autocomplete"
        placeholder="Data field"
        options={options}
        onChange={handleChange}
        isOptionEqualToValue={(option: string, value: string) =>
          option === value
        }
        value={value}
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
      />
    </InputRow>
  );
};
