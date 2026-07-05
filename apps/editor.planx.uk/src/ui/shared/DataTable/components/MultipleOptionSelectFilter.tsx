import FormControl from "@mui/material/FormControl";
import { outlinedInputClasses } from "@mui/material/OutlinedInput";
import TextField from "@mui/material/TextField";
import type { GridFilterInputValueProps } from "@mui/x-data-grid";
import type {
  OptionalAutocompleteProps,
  RequiredAutocompleteProps,
} from "ui/shared/SelectMultiple";
import { StyledAutocomplete } from "ui/shared/SelectMultiple";

type Props<T> = RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T> &
  GridFilterInputValueProps;

export function MultipleOptionSelectFilter<T>(props: Props<T>) {
  const { item, applyValue, options, focusElementRef, ...otherProps } = props;

  const currentValue = Array.isArray(item.value) ? item.value : [];

  return (
    <FormControl sx={{ display: "flex", flexDirection: "column" }}>
      <StyledAutocomplete
        {...otherProps}
        role="status"
        aria-atomic={true}
        aria-live="polite"
        disableCloseOnSelect
        multiple
        disableClearable
        value={currentValue}
        sx={{
          backgroundColor: "transparent",
          [`&. ${outlinedInputClasses.root}`]: {
            backgroundColor: "transparent",
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            slotProps={{
              ...params.slotProps,
              inputLabel: { ...params.slotProps.inputLabel, shrink: true },
            }}
            label="Value"
            variant="outlined"
            inputRef={focusElementRef}
            size="small"
          />
        )}
        slotProps={{
          chip: {
            variant: "uploadedFileTag",
            size: "small",
          },
          popper: {
            sx: {
              width: "max-content !important",
            },
          },
        }}
        options={options}
        onChange={(_e, value) => applyValue({ ...item, value })}
      />
    </FormControl>
  );
}
