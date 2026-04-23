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

  const [inputValue, setInputValue] = React.useState(value || "");
  const skipBlurRef = React.useRef(false);

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleChange = (_event: React.SyntheticEvent, value: string | null) => {
    skipBlurRef.current = true;

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

  const handleBlur = () => {
    if (skipBlurRef.current) {
      skipBlurRef.current = false;
      return;
    }
    if (!allowCustomValues) return;
    const trimmed = inputValue.trim();

    // Auto-commit a typed value on blur if it's new and not already set
    if (trimmed && trimmed !== value && !options.includes(trimmed)) {
      props.onChange(trimmed);
    }
  };

  return (
    <InputRow>
      <ErrorWrapper error={props.errorMessage}>
        <AutocompleteInput
          id="data-field-autocomplete"
          key="data-field-autocomplete"
          data-testid={props["data-testid"]}
          placeholder={placeholder}
          required={Boolean(props.required)}
          onChange={handleChange}
          onBlur={handleBlur}
          inputValue={inputValue}
          onInputChange={(_event, newInputValue) =>
            setInputValue(newInputValue)
          }
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
