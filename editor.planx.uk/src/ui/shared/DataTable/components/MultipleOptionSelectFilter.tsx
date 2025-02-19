import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import React from "react";
import {
  OptionalAutocompleteProps,
  RequiredAutocompleteProps,
  StyledAutocomplete,
} from "ui/shared/SelectMultiple";

type Props<T> = RequiredAutocompleteProps<T> &
  OptionalAutocompleteProps<T> & {
    item: Record<string, any>;
    applyValue: (args: any) => any;
  };

export function MultipleOptionSelectFilter<T>(props: Props<T>) {
  const { item, applyValue } = props;

  return (
    <FormControl sx={{ display: "flex", flexDirection: "column" }}>
      <StyledAutocomplete
        role="status"
        aria-atomic={true}
        aria-live="polite"
        disableCloseOnSelect
        multiple
        renderInput={(params) => (
          <TextField
            {...params}
            InputLabelProps={{
              shrink: true,
            }}
            label="Option"
            variant="standard"
            InputProps={{
              ...params.InputProps,
            }}
          />
        )}
        ChipProps={{
          variant: "uploadedFileTag",
          size: "small",
          sx: { pointerEvents: "none" },
          onDelete: undefined,
        }}
        {...props}
        onChange={(_event, value) => {
          return applyValue({ ...item, value });
        }}
        value={item.value}
      />
    </FormControl>
  );
}
