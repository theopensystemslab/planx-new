import AutocompleteInput from "ui/shared/Autocomplete/AutocompleteInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import InputRow from "ui/shared/InputRow";

interface Props {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  onSelect?: (option: string) => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
}

// Counterpart to DataFieldAutocomplete for title fields
export const TitleAutocomplete: React.FC<Props> = (props) => (
  <InputRow>
    <ErrorWrapper error={props.errorMessage}>
      <AutocompleteInput<string>
        placeholder={props.placeholder}
        required={Boolean(props.required)}
        options={props.options}
        value={null}
        inputValue={props.value || ""}
        onInputChange={(_event, value) => props.onChange(value)}
        onChange={(_event, option) => option && props.onSelect?.(option)}
        disabled={props.disabled}
        freeSolo
        autoHighlight={false}
      />
    </ErrorWrapper>
  </InputRow>
);
